// Central export for all game utilities and assets
export { soundManager } from './sounds'
export { CardAnimator } from './animations'
export { createCardSVG, createCardBackSVG, createBoardSVG } from './svg'

// Card assets
export { createEnhancedCardSVG, createGradientCardBackSVG } from './card-assets'

// Board assets
export {
  createTableBackgroundSVG,
  createPlayerPositionIndicatorSVG,
  createTrickZoneIndicatorSVG,
  createScoreBoardSVG
} from './board-assets'

// UI assets
export {
  createSuitIconSVG,
  createLoadingScreenSVG,
  createVictoryScreenSVG,
  createDefeatScreenSVG,
  createButtonSVG,
  createTrumpPanelSVG
} from './ui-assets'

// Avatar assets
export {
  createPlayerAvatarSVG,
  createPlayerCardSVG,
  createTeamBadgeSVG,
  getAvatarColor,
  AVATAR_STYLES,
  DEFAULT_AVATAR_COLORS,
  type AvatarStyle
} from './avatar-assets'

// Animation assets
export {
  createParticleEffectSVG,
  createTransitionEffectSVG,
  createStreakEffectSVG
} from './animation-assets'
