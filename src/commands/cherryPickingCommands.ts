import { gitRun } from '../utils/gitRawRunner';
import { MagitRepository } from '../models/magitRepository';
import { MenuState, MenuUtil } from '../menu/menu';
import MagitUtils from '../utils/magitUtils';
import { runCommitLikeCommand } from './commitCommands';

const whileCherryPickingMenu = {
  title: 'Cherry-picking',
  commands: [
    { label: 'A', description: 'Continue', action: continueCherryPick },
    { label: 's', description: 'Skip', action: (state: MenuState) => cherryPickControlCommand(state, '--skip') },
    { label: 'a', description: 'Abort', action: (state: MenuState) => cherryPickControlCommand(state, '--abort') }
  ]
};

const cherryPickingMenu = {
  title: 'Cherry-picking',
  commands: [
    { label: 'A', description: 'Pick', action: pick },
    { label: 'a', description: 'Apply', action: applySomeCommit },
    // { label: 'h', description: 'Harvest', action: checkout },
    // { label: 'd', description: 'Donate', action: checkout },
    // { label: 'n', description: 'Spinout', action: checkout },
    // { label: 's', description: 'Spinoff', action: checkout },
  ]
};

export async function cherryPicking(repository: MagitRepository) {

  if (repository.magitState?.cherryPickingState) {
    return MenuUtil.showMenu(whileCherryPickingMenu, { repository });
  } else {
    return MenuUtil.showMenu(cherryPickingMenu, { repository });
  }
}

async function pick({ repository }: MenuState) {
  const target = await MagitUtils.chooseRef(repository, 'Cherry-pick');

  if (target) {
    return cherryPick(repository, target);
  }
}

async function applySomeCommit({ repository }: MenuState) {
  const commit = await MagitUtils.chooseRef(repository, 'Apply changes from commit');

  if (commit) {
    return cherryPick(repository, commit, { noCommit: true });
  }
}

interface CherryPickOptions {
  noCommit?: boolean;
}

export async function cherryPick(repository: MagitRepository, target: string, { noCommit }: CherryPickOptions = {}) {

  const args = ['cherry-pick'];

  if (noCommit) {
    args.push('--no-commit');
  } else {
    args.push('--ff');
  }

  args.push(target);

  return gitRun(repository, args);
}

async function continueCherryPick({ repository }: MenuState) {
  const args = ['cherry-pick', '--continue'];
  return runCommitLikeCommand(repository, args);
}

async function cherryPickControlCommand({ repository }: MenuState, command: string) {
  const args = ['cherry-pick', command];
  return gitRun(repository, args);
}