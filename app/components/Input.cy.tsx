import React from 'react';
import {Input} from '~/components/Input';

describe('<Input />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Input variant="minisearch" />);

    const inputValue = 'hello world';

    // type into the input
    cy.get('input').type(inputValue);
    // make sure input has the value
    cy.get('input').should('have.value', inputValue);
  });
});
