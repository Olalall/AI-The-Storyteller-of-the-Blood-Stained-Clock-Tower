/**
 * Stable role ids published by the official BOTC role catalog.
 *
 * This is intentionally a local snapshot instead of a runtime network request.
 * It is used only to distinguish official-catalog roles from community/custom
 * roles; matching an id does not replace a Wiki-by-Wiki rules review.
 * Source: https://release.botc.app/resources/data/roles.json
 */
export const officialRoleIds = new Set([
  'acrobat', 'alchemist', 'alhadikhia', 'alsaahir', 'amnesiac', 'angel', 'apprentice', 'artist',
  'assassin', 'atheist', 'balloonist', 'banshee', 'barber', 'barista', 'baron', 'beggar', 'bigwig',
  'bishop', 'boffin', 'bonecollector', 'boomdandy', 'bootlegger', 'bountyhunter', 'buddhist',
  'bureaucrat', 'butcher', 'butler', 'cacklejack', 'cannibal', 'cerenovus', 'chambermaid', 'chef',
  'choirboy', 'clockmaker', 'courtier', 'cultleader', 'damsel', 'deusexfiasco', 'deviant',
  'devilsadvocate', 'djinn', 'doomsayer', 'dreamer', 'drunk', 'duchess', 'empath', 'engineer',
  'eviltwin', 'exorcist', 'fanggu', 'farmer', 'fearmonger', 'ferryman', 'fibbin', 'fiddler',
  'fisherman', 'flowergirl', 'fool', 'fortuneteller', 'gambler', 'gangster', 'gardener', 'general',
  'gnome', 'goblin', 'godfather', 'godofug', 'golem', 'goon', 'gossip', 'grandmother', 'gunslinger',
  'harlot', 'harpy', 'hatter', 'hellslibrarian', 'heretic', 'hermit', 'highpriestess', 'hindu',
  'huntsman', 'imp', 'innkeeper', 'investigator', 'judge', 'juggler', 'kazali', 'king', 'klutz',
  'knaves', 'knight', 'legion', 'leviathan', 'librarian', 'lilmonsta', 'lleech', 'lordoftyphon',
  'lunatic', 'lycanthrope', 'magician', 'marionette', 'mastermind', 'mathematician', 'matron',
  'mayor', 'mezepheles', 'minstrel', 'monk', 'moonchild', 'mutant', 'nightwatchman', 'noble',
  'nodashii', 'ogre', 'ojo', 'oracle', 'organgrinder', 'pacifist', 'philosopher', 'pithag', 'pixie',
  'plaguedoctor', 'po', 'poisoner', 'politician', 'pope', 'poppygrower', 'preacher', 'princess',
  'professor', 'psychopath', 'pukka', 'puzzlemaster', 'ravenkeeper', 'recluse', 'revolutionary',
  'riot', 'sage', 'sailor', 'saint', 'savant', 'scapegoat', 'scarletwoman', 'seamstress',
  'sentinel', 'shabaloth', 'shugenja', 'slayer', 'snakecharmer', 'snitch', 'soldier', 'spiritofivory',
  'spy', 'steward', 'stormcatcher', 'summoner', 'sweetheart', 'tealady', 'thief', 'tinker', 'tor',
  'towncrier', 'toymaker', 'undertaker', 'ventriloquist', 'vigormortis', 'villageidiot', 'virgin',
  'vizier', 'vortox', 'voudon', 'washerwoman', 'widow', 'witch', 'wizard', 'wraith', 'xaan',
  'yaggababble', 'zealot', 'zenomancer', 'zombuul',
]) as ReadonlySet<string>
