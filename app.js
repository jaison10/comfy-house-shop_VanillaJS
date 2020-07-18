// variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

//cart
let cart = [];

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
    // console.log(buttons);
    buttons.forEach(button => {
      let id = button.dataset.id;
      //   console.log(`Id is ${id}`);
      let inCart = cart.find(item => item.id === id); // checking if the item is in cart.
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true; // cant press on it if it's already in cart.
      } else {
        button.addEventListener("click", event => {
          console.log(event);
        });
      }
    });
  }
}

//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
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
