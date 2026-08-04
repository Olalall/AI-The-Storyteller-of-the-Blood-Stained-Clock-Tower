/**
 * 判别式联合的编译期穷尽检查：新增分支时调用点会在 `never` 赋值处报错。
 *
 * 刻意不抛异常也不返回 `never`——归档与历史投影必须容忍更新版本写入的未知条目，
 * 运行时兜底由各调用点自行给出，这里只负责让漏处理在 `tsc` 阶段暴露。
 */
export function assertNever(value: never): void {
  void value
}
