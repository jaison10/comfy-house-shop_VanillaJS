// variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

//cart
let cart = [];

//buttons
let buttonsDOM = [];

//getting the products

class Products {
  async getProducts() {
    try {
      let results = await fetch("products.json");
      let data = await results.json();
      let products = data.items; // items is an array.
      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { id, title, price, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}
// display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach(item => {
      result += `<article class="product">
          <div class="img-container">
            <img
              src="${item.image}"
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id="${item.id}">
              <i class="fas fa-shopping-cart"></i>
              add to bag
            </button>
          </div>
          <h3>${item.title}</h3>
          <h4>$${item.price}</h4>
        </article>`;
    });
    productsDOM.innerHTML = result;
  }

  // getting bag buttons
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    // console.log(buttons);
    buttons.forEach(button => {
      let id = button.dataset.id;
      //   console.log(`Id is ${id}`);
      let inCart = cart.find(item => item.id === id); // checking if the item is in cart.
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true; // cant press on it if it's already in cart.
      }
      button.addEventListener("click", event => {
        // console.log(event);
        event.target.innerText = "in cart";
        event.target.disabled = true;
        //get product from products.
        let cartItem = { ...Storage.getProduct(id), amount: 1 }; // amount is the count of no. of items added into cart.(same items)
        // add product to cart.
        cart = [...cart, cartItem];
        //save product to local storage
        Storage.saveCart(cart);
        // set cart values - amount of items changing.
        this.setCartValues(cart);
        // display cart items
        this.addCartItems(cartItem);
        //show the cart
        this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount; //increasing the amount
      itemsTotal += item.amount; // increasing the count.
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2)); // toFixed() sets the number of decimal places.
    cartItems.innerText = itemsTotal;
    // console.log(`Total price is: ${tempTotal} and the count is ${itemsTotal}`);
  }

  addCartItems(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
            <img src="${item.image}" alt="product" />
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id="${item.id}">remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id="${item.id}"></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id="${item.id}"></i>
            </div>`;
    cartContent.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  setUpAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.map(item => {
      this.addCartItems(item);
    });
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
}

//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart")) // ternary operator.
      : []; // if doesnt exists, return empty array
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  // set up app
  ui.setUpAPP();
  //get all the products
  products
    .getProducts()
    .then(products => {
      console.log(products);
      ui.displayProducts(products);
      Storage.saveProducts(products); // since the method is static, no need of an instance.
    })
    .then(() => {
      ui.getBagButtons(); // calling here because bag buttons can be accessed only after loading the products.
    })
    .catch(e => {
      console.log(e);
    });
});
