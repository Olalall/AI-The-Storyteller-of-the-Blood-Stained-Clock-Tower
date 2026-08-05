/**
 * 抽屉页宿主：把既有全屏页原样搬进三档抽屉，**只换容器**。
 *
 * 「原样」是硬要求——页组件本身一行不改。魔典复用的就是纯记录模式的这几张页，
 * 一旦为了进抽屉去改它们，纯记录模式就成了魔典的下游，两模式腐化从这里开始。
 * 因此宿主只做三件事：
 *
 * 1) 补上 Sheet 原来白给的那三样——页名、关闭键、Esc 退出。抽屉本身没有页名的位置，
 *    而前两样随 Radix Dialog 一起留在了旧容器里；第三样是键盘用户关页的默认动作，
 *    页从 Dialog 搬进抽屉后会静默消失，表现为「Esc 没反应」而不是任何报错。
 * 2) 换页时把档位切到这一页的默认档（见 drawerPages）；关页时还回打开前的那一档，
 *    否则关掉本局记录之后抽屉会留在 full，把整块画布继续挡着。
 * 3) 页内容交给调用方给的渲染函数。抽屉不认识各页的 props（session / dispatch / 夜序游标……），
 *    让它认识就等于把这个目录变成四个功能域的下游。
 *
 * 焦点：开页时把焦点移进页容器，因为抽屉不是 modal，没有 Radix 的焦点陷阱，
 * 键盘用户否则会停在画布上，读屏也不会播报页名。关页后焦点回到入口按钮由调用方负责——
 * 那颗按钮在轨道上，不在抽屉里。
 */
import { X } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Button } from '../../../components/ui/Button'
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
  const pageRef = useRef<HTMLElement>(null)

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
    pageRef.current?.focus()
  }, [pageId])

  const handleDetentChange = (next: WorkDrawerDetent) => {
    // 人拖出来的档位一律照做：宿主只在换页那一下定档，之后不跟说书人抢方向盘。
    setDetent(next)
    onDetentChange?.(next)
  }

  /*
   * 只挂在页容器上，不挂 window：页里若弹出嵌套 Sheet，那块内容被 Radix portal 到了 body，
   * 事件不经过这里，Esc 因此只关最内层的那一个。挂 window 会一次关掉两层，
   * 而说书人按 Esc 想撤的永远是刚打开的那一层。
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
        <section className="drawer-page" ref={pageRef} tabIndex={-1} aria-label={pageTitle} onKeyDown={handlePageKeyDown}>
          <header className="drawer-page__head">
            <h2 className="drawer-page__title">{pageTitle}</h2>
            <Button variant="ghost" compact onClick={onClose} aria-label={`关闭${pageTitle}`}>
              <X aria-hidden="true" />
            </Button>
          </header>
          {renderPage ? renderPage() : (
            // 缺渲染函数时必须说话。静默空白会被当成「这一页坏了」，
            // 而真实原因是调用方漏挂了一页，两者的修法完全不同。
            <p className="drawer-page__missing" role="status">「{pageTitle}」还没有接进抽屉。</p>
          )}
        </section>
      ) : children}
    </WorkDrawer>
  )
}
