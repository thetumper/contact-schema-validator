import {fail} from 'assert';
import {find as _find} from 'lodash';
import ContactSchemaValidator from './contact-schema-validator';

/**
 * The test strategy is limited to ensuring the validator works for high-level categories of behavior:
 * 1) No errors when test object conforms to test schema
 * 2) Error when unknown property is included on the test object
 * 3) Error when a required property is not included on the test object
 * 4) Error when a property has an invalid value
 */
describe('ContactSchemaValidator', () => {
  beforeEach(jest.restoreAllMocks);
  describe('#validate', () => {
    test('when testing a valid contact, no error should be thrown', () => {
      const contactObject = {
        contactMechanisms: {
          addresses: [
            {
              line1: '300 E Main St',
              city: 'Madison',
              stateCode: 'WI',
              zip5: '53780',
            },
          ],
          emails: [
            {
              address: 'test@fakedomain.com',
            },
          ],
        },
        name: {
          first: 'John',
          last: 'Smith',
        },
      };

      try {
        ContactSchemaValidator.validate(contactObject);
      } catch (err) {
        // Should not get here
        // eslint-disable-next-line no-console
        console.log('Unexpected error: %o', err);
        fail('Not expecting an error to be thrown.');
      }
    });

    test('when an unknown property is included on a contact, the validator should throw an error', () => {
      const contactObject = {
        contactId: '00000000-0000-0000-0000-000000000001',
        contactMechanisms: {
          addresses: [
            {
              line1: '300 E Main St',
              city: 'Madison',
              stateCode: 'WI',
              zip5: '53780',
              nonsense: 'blah',
            },
          ],
        },
        name: {
          first: 'John',
          last: 'Smith',
        },
      };

      try {
        ContactSchemaValidator.validate(contactObject);
        // Should not get here
        fail('Expected an error to be thrown.');
      } catch (err) {
        expect(err).toBeDefined();
        const patternError = _find(err.errors, {
          message: 'should NOT have additional properties',
          params: {additionalProperty: 'nonsense'},
        });
        expect(patternError).toBeDefined();
      }
    });

    test('when a required property is not included on a contact, the validator should throw an error', () => {
      const contactObject = {
        // Required property 'city' is omitted from the address.
        contactId: '00000000-0000-0000-0000-000000000001',
        contactMechanisms: {
          addresses: [
            {
              line1: '300 E Main St',
              stateCode: 'WI',
              zip5: '53780',
            },
          ],
        },
        name: {
          first: 'John',
          last: 'Smith',
        },
      };

      try {
        ContactSchemaValidator.validate(contactObject);
        // Should not get here
        fail('Expected an error to be thrown.');
      } catch (err) {
        expect(err).toBeDefined();
        const patternError = _find(err.errors, {message: "should have required property 'city'"});
        expect(patternError).toBeDefined();
      }
    });

    test('when a contact has an invalid property value (first name too long), the validator should throw an error', () => {
      // Violates maxLength of 10 for first name
      const contactObject = {
        contactId: '00000000-0000-0000-0000-000000000001',
        contactMechanisms: {
          addresses: [
            {
              line1: '300 E Main St',
              city: 'Madison',
              stateCode: 'WI',
              zip5: '53780',
            },
          ],
        },
        name: {
          first: 'Christopher',
          last: 'Smith',
        },
      };

      try {
        ContactSchemaValidator.validate(contactObject);
        // Should not get here
        fail('Expected an error to be thrown.');
      } catch (err) {
        expect(err).toBeDefined();
        const patternError = _find(err.errors, {message: 'should NOT be longer than 10 characters'});
        expect(patternError).toBeDefined();
      }
    });

    test('when a contact has an invalid property value (state code regex), the validator should throw an error', () => {
      // Violates pattern for state code
      const contactObject = {
        contactId: '00000000-0000-0000-0000-000000000001',
        contactMechanisms: {
          addresses: [
            {
              line1: '300 E Main St',
              city: 'Madison',
              stateCode: 'W3',
              zip5: '53780',
            },
          ],
        },
        name: {
          first: 'Fred',
          last: 'Smith',
        },
      };

      try {
        ContactSchemaValidator.validate(contactObject);
        // Should not get here
        fail('Expected an error to be thrown.');
      } catch (err) {
        expect(err).toBeDefined();
        const patternError = _find(err.errors, {message: 'should match pattern "^([A-Z]{2})$"'});
        expect(patternError).toBeDefined();
      }
    });
  });
});
