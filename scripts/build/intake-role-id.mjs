// Intake identity hints only. Existing packs, saved sessions and source bytes keep their original IDs.
const aliases = Object.freeze({
  plague_doctor:'plaguedoctor', ban_shou_ren:'lycanthrope', dai_gua:'klutz',
  qin_tian_jian:'qintianjian', bian_lian_shi:'bianlianshi', dao_ke:'daoke',
  jiu_bao_outsider:'jiubao', liu_gong_jiu_bao:'jiubao',
})
export const intakeRoleId = (id, normalize = value => value) => aliases[normalize(id)] ?? normalize(id)
