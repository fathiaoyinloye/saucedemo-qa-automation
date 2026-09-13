// Generic login mechanism — written once
Cypress.Commands.add("login", (username, password) => {
  cy.get('[data-test="username"]').type(username);
  cy.get('[data-test="password"]').type(password);
  cy.get('[data-test="login-button"]').click();
});

// Named, readable login wrappers — one per supplied persona
Cypress.Commands.add("loginAsStandardUser", () => cy.login("standard_user", "secret_sauce"));
Cypress.Commands.add("loginAsLockedOutUser", () => cy.login("locked_out_user", "secret_sauce"));
Cypress.Commands.add("loginAsProblemUser", () => cy.login("problem_user", "secret_sauce"));
Cypress.Commands.add("loginAsPerformanceGlitchUser", () => cy.login("performance_glitch_user", "secret_sauce"));

// Cart and checkout commands — centralize repeated interactions
Cypress.Commands.add("addProductToCart", (productSlug) => {
  cy.get(`[data-test="add-to-cart-${productSlug}"]`).click();
});

Cypress.Commands.add("goToCheckout", () => {
  cy.get('[data-test="shopping-cart-link"]').click();
  cy.get('[data-test="checkout"]').click();
});

Cypress.Commands.add("fillCheckoutInfo", (firstName, lastName, postalCode) => {
  cy.get('[data-test="firstName"]').type(firstName);
  cy.get('[data-test="lastName"]').type(lastName);
  cy.get('[data-test="postalCode"]').type(postalCode);
  cy.get('[data-test="continue"]').click();
});