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
  createInitialState,
  diagnoseShortageDoctor,
  emptyStock,
  endTurn,
  FACTORY_RECIPES,
  fixClassLabel,
  hexDisk,
  hubStock,
  REFINE_RECIPES,
  removeRoute,
  spendAtFactory,
  stockOf,
}
