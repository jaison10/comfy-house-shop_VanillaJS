// contentful
const client = contentful.createClient({
  // this is the space ID. Space is the project folder
  space: "kwm2knt4yln7",
  // this is the access token for the space
  accessToken: "SLERw4oHpdsoZU3XVE3nDCg6KiluupSSZwEcizBRZzM"
});
console.log(client);

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
 document.getElementById("shopnow").addEventListener("click", ()=>{
//   window.scrollTo(500,0);
  console.log("Has to scroll");
});

//cart
let cart = [];

//buttons
let buttonsDOM = [];

//getting the products
// shopNow.addEventListener("click", ()=>{
// //   window.scrollTo(500,0);
//   console.log("Has to scroll");
// });
class Products {
  async getProducts() {
    try {
      // getting data from contentful model
      let contentful = await client.getEntries({
        content_type: "comfyHouseProducts" // bcz for one space there can be multiple content model. I want data from only this model.
      });

      let results = await fetch("products.json"); // getting data from local file
      let data = await results.json();

      let products = contentful.items; // items is an array. Use "contentful" to get from contentful model. Use "data" for local data.

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
              add to cart
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
  cartLogic() {
    // clear cart button work
    clearCartBtn.addEventListener("click", () => {
      this.clearCart(); // here 'this' will be pointing to UI class. If it was called directly instead of ()=>{}, then it wud have pointed to button clicked.
    });
    //cart functionality.
    cartContent.addEventListener("click", event => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        this.removeItem(id); // this removes from the storage, cart array and edits the button and all.
        cartContent.removeChild(removeItem.parentElement.parentElement); // removing that item from DOM of cart.
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let currentAmount = event.target;
        let id = currentAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount += 1;
        Storage.saveCart(cart); // new amount added to cart
        this.setCartValues(cart);
        currentAmount.nextElementSibling.innerText = tempItem.amount; // updating amount shown
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let currentAmount = event.target;
        let id = currentAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount -= 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart); // new amount added to cart
          this.setCartValues(cart);
          currentAmount.previousElementSibling.innerText = tempItem.amount; // updating amount shown
        } else {
          cartContent.removeChild(currentAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map(item => item.id); // will give id of all the items present in cart.
    console.log(cartItems);
    cartItems.forEach(id => this.removeItem(id));

    // removing all the items from cart list HTML.
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter(item => item.id !== id); // update the cart only with the items that doesnt have the passed id.
    this.setCartValues(cart); // updating the count and total price.
    Storage.saveCart(cart); // this updates the local storage with the new cart items.
    let button = this.getSingleButton(id); // getting button of this item from the buttons list.
    button.disabled = false; // buttons to add into cart shud be enabled again.
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>Add to cart`;
  }
  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id); //returning the button searhed for from the list.
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
      ui.cartLogic(); // clearing the cart.
    })
    .catch(e => {
      console.log(e);
    });
});

