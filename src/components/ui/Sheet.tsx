/**
 * 全屏页 / 侧滑面板的唯一外壳，外加一条**内联呈现**分支。
 *
 * 为什么需要内联分支：Sheet 的默认形态是 Radix `Dialog.Portal`，无条件挂到 document.body。
 * 魔典要把六个既有全屏页「原样搬进工作抽屉」，而 portal 出去之后抽屉的三档高度、
 * overflow、peek 档的 inert 对页一概无效，`.sheet-overlay` 又是 position: fixed 铺满视口——
 * 页照常显示，座位环被整块糊掉。这是最容易被误判为成功的失败形态：截图上一切正常。
 *
 * 内联分支的开关不走 props 而走 context，理由是硬要求：那六个页组件一行都不许改，
 * 它们写死了自己那句 `<Sheet presentation="page">`。宿主在外面套一层
 * SheetInlineSurfaceProvider，页里的 Sheet 自己读到就地渲染。
 * 读到之后立刻把 context 复位成 null（见下方 Provider value={null}）：
 * 页里再弹出的嵌套 Sheet（座位编辑器之类）仍然是真模态，照旧 portal + 铺遮罩。
 * 少了这一步，配板页里的座位编辑器会内联长在配板页中间，既盖不住下面也关不掉。
 *
 * 内联态不用 Radix Dialog，三条理由：
 * 1) `Dialog.Content` 即便 modal={false} 也带 DismissableLayer，点外面就关——
 *    而抽屉外面正是座位环，说书人点一下座位页就没了；
 * 2) 它会给出 role="dialog"。抽屉不是模态：环仍可点、轨道仍可按，
 *    对读屏宣告「对话框」是撒谎，用户会去找一个并不存在的「关闭后回到原处」；
 * 3) Portal 可以不用，但 FocusScope 的 onMountAutoFocus / onUnmountAutoFocus 仍会插手，
 *    与宿主自己的移焦打架。
 * 不走 Dialog 就得自己把无障碍补齐：内联根是有名字的 section（= region），
 * aria-labelledby 指页名、aria-describedby 指副标题、tabIndex=-1 让宿主能把焦点送进来，
 * 关闭键带「关闭<页名>」。这几条由 Sheet.test.tsx 锁住。
 *
 * Esc 与焦点归属**都归宿主**，Sheet 内联态一概不听：
 * 「关掉这一页」在抽屉里意味着退回步骤台而不是关掉抽屉（抽屉没有关闭态，最矮也是 peek），
 * 只有宿主知道这件事；而 Esc 需要判断事件是不是来自嵌套 portal，那也只有宿主看得全。
 * 关闭键仍只调 onOpenChange(false)，与 portal 态一字不差——调用方必须把它接到关页上。
 */
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { createContext, useContext, useId, type PropsWithChildren, type ReactNode } from 'react'
import './ui.css'

/** 宿主与内联 Sheet 之间的全部约定。字段只有两个，多一个都会把抽屉变成页的下游。 */
export interface SheetInlineSurface {
  /**
   * 覆盖页名。给「更换 5号 角色」这类必须带座位号的页用；不传时页保留自己的标题
   * （本局记录会随子态在「本局记录 / 更正记录」之间变，那是有用的信息，不该被注册表压平）。
   */
  title?: string
  /**
   * 交出内联根节点。宿主拿它来移焦——焦点必须落在**带名字**的那个节点上，
   * 否则读屏只会念一个空容器，用户不知道自己进了哪一页。
   * 卸载时收到 null，宿主据此知道这一页没自带页头，得自己补一个。
   */
  claimRoot: (root: HTMLElement | null) => void
}

const InlineSurfaceContext = createContext<SheetInlineSurface | null>(null)

export function SheetInlineSurfaceProvider({ surface, children }: PropsWithChildren<{ surface: SheetInlineSurface }>) {
  return <InlineSurfaceContext.Provider value={surface}>{children}</InlineSurfaceContext.Provider>
}

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  trigger?: ReactNode
  contentClassName?: string
  presentation?: 'sheet' | 'page'
  layer?: 'default' | 'nested'
}

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  trigger,
  contentClassName = '',
  presentation = 'sheet',
  layer = 'default',
  children,
}: PropsWithChildren<SheetProps>) {
  const inlineSurface = useContext(InlineSurfaceContext)
  const titleId = useId()
  const descriptionId = useId()

  if (inlineSurface) {
    // 关着的页不留残骸：portal 态由 Radix 卸载，内联态得自己让位，
    // 否则抽屉里会叠着一堆已关闭页的 DOM，peek 档的 inert 也会盖到它们头上。
    if (!open) return null
    // trigger 内联态一律不渲染。它是 Dialog.Trigger，没有 Dialog 就只是一颗死键；
    // 何况夜序总览那颗「夜间顺序」按钮渲染在抽屉里，等于在这一页里再放一个进入这一页的入口。
    // 抽屉里的页由轨道上的入口打开，不由页自己。
    const shownTitle = inlineSurface.title ?? title
    return (
      <section
        ref={inlineSurface.claimRoot}
        tabIndex={-1}
        className={`sheet-content sheet-content--${presentation} sheet-content--${layer} sheet-content--inline ${contentClassName}`}
        data-presentation="inline"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className="sheet-header">
          <div>
            <h2 id={titleId}>{shownTitle}</h2>
            <p id={descriptionId}>{description}</p>
          </div>
          <button type="button" className="sheet-close" aria-label={`关闭${shownTitle}`} onClick={() => onOpenChange(false)}>
            <X aria-hidden="true" />
          </button>
        </header>
        <div className="sheet-body">
          {/* 一次性开关：这一层之下恢复默认，嵌套 Sheet 仍是真模态。 */}
          <InlineSurfaceContext.Provider value={null}>{children}</InlineSurfaceContext.Provider>
        </div>
      </section>
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <Dialog.Portal>
        <Dialog.Overlay className={`sheet-overlay sheet-overlay--${layer}`} />
        <Dialog.Content className={`sheet-content sheet-content--${presentation} sheet-content--${layer} ${contentClassName}`} data-presentation={presentation}>
          <header className="sheet-header">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description>{description}</Dialog.Description>
            </div>
            <Dialog.Close className="sheet-close" aria-label={`关闭${title}`}>
              <X aria-hidden="true" />
            </Dialog.Close>
          </header>
          <div className="sheet-body">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
