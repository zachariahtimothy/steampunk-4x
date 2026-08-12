import { axialToPixel, hexDisk } from './hex'
import {
  addRoute,
  endTurn,
  hubStock,
  removeRoute,
  spendAtFactory,
} from './logistics'
import {
  diagnoseShortageDoctor,
  fixClassLabel,
} from './shortageDoctor'
import {
  clearDraft,
  draftValidation,
  produceMark,
  saveMarkDesign,
  setDraftPart,
  unlockInvent,
} from './invent/actions'
import {
  partsForSlot,
  SANDBOX_CHASSIS,
  SANDBOX_PARTS,
  partById,
} from './invent/catalog'
import { emptyLoadout, validateMark } from './invent/validate'
import {
  createInitialState,
  emptyStock,
  FACTORY_RECIPES,
  REFINE_RECIPES,
  stockOf,
  type AxialCoord,
  type BulkResourceId,
  type FactoryRecipeId,
  type FixClass,
  type GameState,
  type GoodId,
  type IntermediateId,
  type ResourceId,
  type ResourceNode,
  type Route,
  type ShortageAlert,
  type Site,
  type SiteKind,
} from './types'

export type {
  AxialCoord,
  BulkResourceId,
  FactoryRecipeId,
  FixClass,
  GameState,
  GoodId,
  IntermediateId,
  ResourceId,
  ResourceNode,
  Route,
  ShortageAlert,
  Site,
  SiteKind,
}

export {
  addRoute,
  axialToPixel,
  clearDraft,
  createInitialState,
  diagnoseShortageDoctor,
  draftValidation,
  emptyLoadout,
  emptyStock,
  endTurn,
  FACTORY_RECIPES,
  fixClassLabel,
  hexDisk,
  hubStock,
  partById,
  partsForSlot,
  produceMark,
  REFINE_RECIPES,
  removeRoute,
  SANDBOX_CHASSIS,
  SANDBOX_PARTS,
  saveMarkDesign,
  setDraftPart,
  spendAtFactory,
  stockOf,
  unlockInvent,
  validateMark,
}
