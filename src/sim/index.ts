import { axialToPixel, hexDisk } from './hex'
import {
  addRoute,
  endTurn,
  hubStock,
  removeRoute,
  spendAtFactory,
} from './logistics'
import {
  createInitialState,
  emptyStock,
  FACTORY_RECIPES,
  REFINE_RECIPES,
  stockOf,
  type AxialCoord,
  type BulkResourceId,
  type FactoryRecipeId,
  type GameState,
  type GoodId,
  type IntermediateId,
  type ResourceId,
  type ResourceNode,
  type Route,
  type Site,
  type SiteKind,
} from './types'

export type {
  AxialCoord,
  BulkResourceId,
  FactoryRecipeId,
  GameState,
  GoodId,
  IntermediateId,
  ResourceId,
  ResourceNode,
  Route,
  Site,
  SiteKind,
}

export {
  addRoute,
  axialToPixel,
  createInitialState,
  emptyStock,
  endTurn,
  FACTORY_RECIPES,
  hexDisk,
  hubStock,
  REFINE_RECIPES,
  removeRoute,
  spendAtFactory,
  stockOf,
}
