import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { libGenerator } from './generator';
import { LibGeneratorSchema } from './schema';

describe('lib generator', () => {
  let tree: Tree;
  const options: LibGeneratorSchema = { name: 'test', type: 'lib' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await libGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'lib-test');
    expect(config).toBeDefined();
  });
});
