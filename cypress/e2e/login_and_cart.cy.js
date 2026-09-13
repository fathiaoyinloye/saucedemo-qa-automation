describe("SauceDemo", () => {

  it("standard user can log in and add a product", () => {
    cy.visit("/");
    cy.loginAsStandardUser();
    cy.url().should("include", "/inventory.html");
    cy.get('[data-test="title"]').should("have.text", "Products");

    cy.addProductToCart("sauce-labs-backpack");
    cy.get('[data-test="shopping-cart-badge"]').should("have.text", "1");
    cy.get('[data-test="remove-sauce-labs-backpack"]').should("be.visible");
  });

  it("invalid credentials are rejected", () => {
    cy.visit("/");
    cy.login("standard_user", "wrong_password");
    cy.url().should("include", "saucedemo.com");
    cy.get('[data-test="error"]').should("be.visible");
  });

  it("locked-out user cannot log in", () => {
    cy.visit("/");
    cy.loginAsLockedOutUser();
    cy.get('[data-test="error"]')
      .should("be.visible")
      .and("contain.text", "locked out");
  });

  it("checkout fields should remain independent for problem user", () => {
    cy.visit("/");
    cy.loginAsProblemUser();
    cy.addProductToCart("sauce-labs-backpack");
    cy.goToCheckout();

    cy.get('[data-test="firstName"]').type("Fathia");
    cy.get('[data-test="lastName"]').type("Oyinloye");

    // EXPECTED (correct) behavior: First Name should still read "Fathia".
    // KNOWN DEFECT (TC-012): problem_user's Last Name entry overwrites
    // First Name. This asserts the CORRECT behavior, so it fails (red)
    // against the current app — that failure IS the finding.
    cy.get('[data-test="firstName"]').should("have.value", "Fathia");
  });

  it("performance_glitch_user eventually logs in successfully", () => {
    cy.visit("/");
    cy.loginAsPerformanceGlitchUser();
    // No fixed time threshold asserted — none is specified in the
    // assessment requirements. Cypress's default retry/timeout window
    // covers the expected delay. See TC-013.
    cy.url().should("include", "/inventory.html");
    cy.get('[data-test="title"]').should("have.text", "Products");
  });

  it("user can remove a product from cart", () => {
    cy.visit("/");
    cy.loginAsStandardUser();
    cy.addProductToCart("sauce-labs-backpack");
    cy.get('[data-test="shopping-cart-badge"]').should("have.text", "1");

    cy.get('[data-test="remove-sauce-labs-backpack"]').click();
    cy.get('[data-test="shopping-cart-badge"]').should("not.exist");
  });

  it("checkout requires required information", () => {
    cy.visit("/");
    cy.loginAsStandardUser();
    cy.addProductToCart("sauce-labs-backpack");
    cy.goToCheckout();
    cy.get('[data-test="continue"]').click();
    cy.get('[data-test="error"]').should("be.visible");
  });

  it("checkout should be blocked when the cart is empty", () => {
    cy.visit("/");
    cy.loginAsStandardUser();
    cy.goToCheckout();
    cy.fillCheckoutInfo("Fathia", "Oyinloye", "100001");
    cy.get('[data-test="finish"]').click();

    // EXPECTED (correct) behavior: with an empty cart, the order should
    // NOT complete. KNOWN DEFECT (TC-011): the app currently allows it.
    // This asserts the correct behavior, so it fails (red) against the
    // current app — that failure IS the finding.
    cy.get('[data-test="error"]').should("be.visible");
  });

  it("cart contents should not carry over between different users (TC-014)", () => {
    cy.visit("/");
    cy.loginAsStandardUser();
    cy.addProductToCart("sauce-labs-backpack");
    cy.get('[data-test="shopping-cart-badge"]').should("have.text", "1");

    cy.get('#react-burger-menu-btn').click();
    cy.get('[data-test="logout-sidebar-link"]').click();

    cy.loginAsPerformanceGlitchUser();

    // EXPECTED (correct) behavior: User B's cart should be empty.
    // POTENTIAL FINDING (TC-014): if the app carries over User A's item,
    // this assertion fails (red) — flagged for product clarification,
    // not asserted as a confirmed defect.
    cy.get('[data-test="shopping-cart-badge"]').should("not.exist");
  });

  it("user can view product details", () => {
    cy.visit("/");
    cy.loginAsStandardUser();
    cy.get('[data-test="item-4-title-link"]').click(); // VERIFY this selector
    cy.get('[data-test="inventory-item-name"]').should("be.visible");
    cy.get('[data-test="inventory-item-price"]').should("be.visible");
  });

  it("user can add multiple products to the cart", () => {
    cy.visit("/");
    cy.loginAsStandardUser();
    cy.addProductToCart("sauce-labs-backpack");
    cy.addProductToCart("sauce-labs-bike-light");
    cy.addProductToCart("sauce-labs-bolt-t-shirt");
    cy.get('[data-test="shopping-cart-badge"]').should("have.text", "3");
  });

  it("user can complete checkout with valid information", () => {
    cy.visit("/");
    cy.loginAsStandardUser();
    cy.addProductToCart("sauce-labs-backpack");
    cy.goToCheckout();
    cy.fillCheckoutInfo("Fathia", "Oyinloye", "100001");
    cy.get('[data-test="finish"]').click();
    cy.get('[data-test="complete-header"]').should("have.text", "Thank you for your order!");
  });

  const products = [
    "sauce-labs-backpack",
    "sauce-labs-bike-light",
    "sauce-labs-bolt-t-shirt",
    "sauce-labs-fleece-jacket",
    "sauce-labs-onesie",
    "test.allthethings()-t-shirt-(red)" // VERIFY exact value before running
  ];

  products.forEach((product) => {
    it(`problem_user can add ${product} to cart`, () => {
      cy.visit("/");
      cy.loginAsProblemUser();
      cy.addProductToCart(product);
      // EXPECTED (correct) behavior: cart badge should show 1 after adding.
      // POTENTIAL DEFECT: problem_user was observed failing to add certain
      // products. This loop identifies exactly which ones, if any, fail.
      cy.get('[data-test="shopping-cart-badge"]').should("have.text", "1");
    });
  });

  it("problem_user should see distinct product images (known defect)", () => {
    cy.visit("/");
    cy.loginAsProblemUser();

    cy.get('[data-test$="-img"]').then(($imgs) => {
      const sources = [...$imgs].map((img) => img.getAttribute("src"));
      const uniqueSources = new Set(sources);

      // EXPECTED (correct) behavior: each product should have its own
      // distinct image, so uniqueSources.size should be greater than 1.
      // KNOWN DEFECT: problem_user was observed seeing the same image
      // repeated for every product — this asserts the correct behavior,
      // so it fails (red) if all images are identical.
      expect(uniqueSources.size).to.be.greaterThan(1);
    });
  });

});