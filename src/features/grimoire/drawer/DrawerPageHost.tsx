/**
 * 抽屉页宿主：把既有全屏页原样搬进三档抽屉，**只换容器**。
 *
 * 「原样」是硬要求——页组件本身一行不改。魔典复用的就是纯记录模式的这几张页，
 * 一旦为了进抽屉去改它们，纯记录模式就成了魔典的下游，两模式腐化从这里开始。
 * 因此宿主只做四件事：
 *
 * 1) 给页开一块内联呈现面（SheetInlineSurfaceProvider）。五页的根都是
 *    `<Sheet presentation="page">`，默认会 portal 到 document.body——那样抽屉里是空的，
 *    页照旧全屏盖住座位环，而截图上一切正常。套上这层之后页才真正落在抽屉的 DOM 里，
 *    三档高度、overflow、peek 档 inert 也才对它生效。
 * 2) 换页时把档位切到这一页的默认档（见 drawerPages）；关页时还回打开前的那一档，
 *    否则关掉本局记录之后抽屉会留在 full，把整块画布继续挡着。
 * 3) 补 Esc 退出。这一条是 Radix Dialog 白给的，页搬出 Dialog 后会静默消失，
 *    表现为「Esc 没反应」而不是任何报错。
 * 4) 页内容交给调用方给的渲染函数。抽屉不认识各页的 props（session / dispatch / 夜序游标……），
 *    让它认识就等于把这个目录变成四个功能域的下游。
 *
 * 页头归谁：页自带 Sheet 页头（页名 + 副标题 + 关闭键），所以内联时**由页出**，
 * 宿主不再画第二份——两个标题两颗关闭键，读屏会把同一页念两遍。
 * 只有渲染函数交出的不是 Sheet 时（内联面没被认领）宿主才自己补一个页头兜底。
 * 副标题不能丢：它是「当前：僧侣」「共 23 条 · 只读回放」这类正文，
 * 由宿主统一画页头就必然丢掉，那是内容回归而不只是样式差异。
 *
 * 关页由谁触发：调用方必须把页的 onOpenChange(false) 接到关页上。
 * 页内部也会自己调它（配板确认后就关自己），Sheet 拦不住那一条，宿主更看不见。
 *
 * 焦点：开页时把焦点送进页里那个**有名字**的根节点（内联 Sheet 交出来的那个），
 * 抽屉不是 modal，没有 Radix 的焦点陷阱，不主动移焦键盘用户会停在画布上；
 * 关页时把焦点还给打开它的那颗键——这条同样是 Dialog 白给的，不还就是把人丢回 body 从头 Tab。
 */
import { X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Button } from '../../../components/ui/Button'
import { SheetInlineSurfaceProvider, type SheetInlineSurface } from '../../../components/ui/Sheet'
import { WorkDrawer, type WorkDrawerPeekSlot } from './WorkDrawer'
import { DRAWER_PAGES, type DrawerHostedPageId } from './drawerPages'
import type { WorkDrawerDetent } from './detents'

/** 一页的渲染函数。调用方闭包住这一页需要的 props，宿主只负责挂上去。 */
export type DrawerPageRenderer = () => ReactNode

export type DrawerPageRenderers = Partial<Record<DrawerHostedPageId, DrawerPageRenderer>>

export interface DrawerPageHostProps {
  /** 当前打开的抽屉页；null = 没有页，抽屉里是步骤台（children）。 */
  pageId: DrawerHostedPageId | null
  pages: DrawerPageRenderers
  /** 抽屉顶部常驻的手势契约。它跟当前**步骤**走，不跟页走，所以由调用方给。 */
  gestureContract: string
  /**
   * 覆盖注册表标题。给「更换 5号 角色」这类带座位号的页用——
   * 丢掉座位号，说书人就不知道自己在改谁，而这一页是不可逆的。
   */
  title?: string
  onClose: () => void
  onDetentChange?: (detent: WorkDrawerDetent) => void
  peekSlot?: WorkDrawerPeekSlot
  children?: ReactNode
}

export function DrawerPageHost({
  pageId,
  pages,
  gestureContract,
  title,
  onClose,
  onDetentChange,
  peekSlot,
  children,
}: DrawerPageHostProps) {
  const [detent, setDetent] = useState<WorkDrawerDetent>('peek')
  /** 开页前那一档。关页要还回去，不能把画布一直挡着。 */
  const [restoreDetent, setRestoreDetent] = useState<WorkDrawerDetent>('peek')
  const [shownPageId, setShownPageId] = useState<DrawerHostedPageId | null>(null)
  /**
   * 页头归谁。默认 host：渲染函数交出的可能根本不是 Sheet（占位内容、将来的非 Sheet 页），
   * 那时没人画页名与关闭键，页在抽屉里就没有出口。内联 Sheet 挂载时认领这块面，
   * 认领动作发生在 commit 阶段，React 会在浏览器绘制前同步补一次渲染，所以看不到两份页头闪一下。
   */
  const [chromeOwner, setChromeOwner] = useState<'host' | 'page'>('host')
  const pageRef = useRef<HTMLElement>(null)
  /** 内联 Sheet 的根节点：它才是那个带 aria-labelledby 的元素，移焦要落在它上面。 */
  const inlineRootRef = useRef<HTMLElement | null>(null)

  // 身份必须稳定：ref 回调每渲染换一个函数，React 会先 null 再重挂，
  // 而这个回调会 setState —— 那就是一个每帧自我触发的循环。
  const claimRoot = useCallback((root: HTMLElement | null) => {
    inlineRootRef.current = root
    setChromeOwner(root ? 'page' : 'host')
  }, [])
  const inlineSurface = useMemo<SheetInlineSurface>(() => ({ title, claimRoot }), [title, claimRoot])

  // 在渲染中对齐档位而不是用 effect：effect 会先画一帧旧档位再跳，
  // full 页因此会从 96px 弹上来一次，看起来像抽屉自己抽了一下。
  if (pageId !== shownPageId) {
    setShownPageId(pageId)
    if (pageId) {
      // 只在「从没有页」进来时记录还原点：页与页之间互切时，还原点仍是最初那一档。
      if (!shownPageId) setRestoreDetent(detent)
      setDetent(DRAWER_PAGES[pageId].defaultDetent)
    } else {
      setDetent(restoreDetent)
    }
  }

  useEffect(() => {
    if (!pageId) return
    // 记的是「开这一页之前谁有焦点」——此刻页刚挂上，焦点还没动，activeElement 就是入口那颗键。
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    // 优先内联根：宿主自己的 section 在页自带页头时是匿名的，焦点落上去读屏念不出页名。
    ;(inlineRootRef.current ?? pageRef.current)?.focus()
    return () => {
      // isConnected 判一次：入口键可能随页一起被换掉了（换角色页关掉时那一行已经重画），
      // 给一个已卸载的节点 focus 等于把焦点丢回 body。
      if (opener?.isConnected) opener.focus()
    }
  }, [pageId])

  const handleDetentChange = (next: WorkDrawerDetent) => {
    // 人拖出来的档位一律照做：宿主只在换页那一下定档，之后不跟说书人抢方向盘。
    setDetent(next)
    onDetentChange?.(next)
  }

  /*
   * Esc 关页，不是关抽屉——抽屉根本没有关闭态，最矮也是 peek。
   * 「关掉抽屉」只能解释成收到 peek，而那会让一张仍然打开着的页变成看不见的页，
   * 是对状态撒谎。Esc 撤销的是刚刚那次「打开页」，抽屉留在原地。
   *
   * defaultPrevented 这一句是承重墙，不是防御性冗余。页里弹出的嵌套 Sheet
   * 被 Radix portal 到了 body，但 React 合成事件仍沿**组件树**冒到这里，
   * 所以这个 handler 照样会收到座位编辑器里的那一下 Esc。
   * 救场的是 Radix 在捕获阶段就 preventDefault 了它（DismissableLayer 只让最上层响应）：
   * 删掉这个判断，在座位编辑器里按 Esc 会连带把整张配板页一起关掉，
   * 而说书人想撤的永远是最内层刚打开的那一个。
   */
  const handlePageKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || event.defaultPrevented) return
    event.preventDefault()
    onClose()
  }

  const pageTitle = pageId ? title ?? DRAWER_PAGES[pageId].title : undefined
  const renderPage = pageId ? pages[pageId] : undefined

  return (
    <WorkDrawer
      gestureContract={gestureContract}
      detent={detent}
      onDetentChange={handleDetentChange}
      label={pageTitle ?? '工作抽屉'}
      peekSlot={peekSlot}
    >
      {pageId && pageTitle ? (
        <section
          className="drawer-page"
          ref={pageRef}
          // 页自带页头时这层容器保持匿名：它和页内联根同名的话，
          // 读屏会连着念两个同名区域，用户以为自己开了两页。
          tabIndex={chromeOwner === 'host' ? -1 : undefined}
          aria-label={chromeOwner === 'host' ? pageTitle : undefined}
          onKeyDown={handlePageKeyDown}
        >
          {chromeOwner === 'host' ? (
            <header className="drawer-page__head">
              <h2 className="drawer-page__title">{pageTitle}</h2>
              <Button variant="ghost" compact onClick={onClose} aria-label={`关闭${pageTitle}`}>
                <X aria-hidden="true" />
              </Button>
            </header>
          ) : null}
          <SheetInlineSurfaceProvider surface={inlineSurface}>
            {renderPage ? renderPage() : (
              // 缺渲染函数时必须说话。静默空白会被当成「这一页坏了」，
              // 而真实原因是调用方漏挂了一页，两者的修法完全不同。
              <p className="drawer-page__missing" role="status">「{pageTitle}」还没有接进抽屉。</p>
            )}
          </SheetInlineSurfaceProvider>
        </section>
      ) : children}
    </WorkDrawer>
  )
}
