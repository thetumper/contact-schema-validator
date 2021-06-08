import {get as _get} from 'lodash';
import Ajv from 'ajv';
import jsYaml from 'js-yaml';
import contactsAPISpec from '../contact-api-spec.yaml';

class ContactSchemaValidator {
  /**
   * Validates the given Contact object against the Contact schema used internally within the Contacts system.
   *
   * @param {*} contactObject
   * @throws {Error} An Error is thrown when any validation errors exist.
   */
  static validate(contactObject) {
    // Load schemas from the Contacts internal schema (openapi) spec.
    const contactsInternalSpecJSON = jsYaml.load(contactsAPISpec);
    const models = _get(contactsInternalSpecJSON, 'components.schemas', []);
    const contactsModel = _get(models, 'Contacts', {});

    // Create validator, add and compile schemas.
    const ajv = new Ajv({allErrors: true});
    const modelNames = Object.getOwnPropertyNames(models);
    modelNames.forEach((modelName) => {
      const modelKey = `#/components/schemas/${modelName}`;
      ajv.addSchema(models[modelName], modelKey);
    });
    const validate = ajv.compile(contactsModel);

    // Validate...
    const valid = validate(contactObject);
    if (!valid) {
      const message = `Validation of contact object failed.  Errors: ${validate.errors}`;
      const error = new Error(message);
      error.errors = validate.errors;

      throw error;
    }
  }
}

export default ContactSchemaValidator;
