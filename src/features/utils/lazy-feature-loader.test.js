import { faker } from '@faker-js/faker'
import { FEATURE_NAMES } from '../../loaders/features/features'
import { lazyFeatureLoader } from './lazy-feature-loader'

// Use enableAutomock to make it easier to mock all the things that get imported by the aggregators
jest.enableAutomock()
// Unmock the file under test and the constants file
jest.unmock('../../loaders/features/features')
jest.unmock('./lazy-feature-loader')

test.each(Object.keys(FEATURE_NAMES))('should import the aggregate for feature %s', async (key) => {
  const featureName = FEATURE_NAMES[key]
  const randomId = faker.datatype.uuid()

  jest.setMock(`../${featureName}/aggregate`, {
    id: randomId,
    featureName
  })

  const result = await lazyFeatureLoader(featureName, 'aggregate')

  expect(result.id).toEqual(randomId)
  expect(result.featureName).toEqual(featureName)
})

test('should throw an error when the featureName is not supported', async () => {
  const featureName = faker.datatype.uuid()

  expect(() => lazyFeatureLoader(featureName, 'aggregate')).toThrow()
})

test('should return undefined when the featurePart is not supported', async () => {
  const featureName = faker.datatype.uuid()
  const featurePart = faker.datatype.uuid()

  expect(lazyFeatureLoader(featureName, featurePart)).toBeUndefined()
})
