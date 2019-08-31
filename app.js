//get API
const client = contentful.createClient({
  space: "np5xiu7p1a25",
  accessToken: "rZ3ZfI6DzVOoGzafNQ5Tw3Z4iFNvP0Z1AMP-0_HPaZ8"
});

const container = document.querySelector(".container-box");
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cateDOM = document.querySelector(".cate");
const cateOverlay = document.querySelector(".cate-overlay");
const cateBtn = document.querySelector(".cate-btn");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const gridContainer = document.querySelector(".grid-container");
const productTitle = document.querySelector(".product-title");
const priceSelect = document.getElementById("price-select");
const logo = document.querySelector(".logo");

//cart
let cart = [];
// button
let buttonsDOM = [];
//products
let listProducts = [];

//getting the product
class Products {
  async getProducts() {
    try {
      let contentful = await client.getEntries({
        content_type: "comfyHouseProduct"
      });

      // let result = await fetch("products.json");
      // let data = await result.json();
      let products = contentful.items;
      products = products.map(item => {
        const { title, price, type } = item.fields;
        const { id } = item.sys;
        let image = item.fields.image.fields.file.url;
        image = "https:" + image;
        return {
          title,
          price,
          id,
          image,
          type
        };
      });

      listProducts = products;

      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

class category {
  displayCategory(products) {
    let results = "";
    let categoryList = products.map(item => {
      return item.type;
    });

    categoryList = categoryList.filter((value, index, array) => {
      return array.indexOf(value) === index;
    });

    categoryList.map(item => {
      results += `
               <div class="grid-item cate-item">${item}</div>
      `;
    });

    gridContainer.innerHTML = results;
  }

  cateButton() {
    cateBtn.addEventListener("click", event => {
      if (cateOverlay.classList.contains("transparentBcg")) {
        this.hideCate();
      } else {
        this.showCate();
      }
    });
  }

  showCate() {
    cateOverlay.classList.add("transparentBcg");
  }

  hideCate() {
    cateOverlay.classList.remove("transparentBcg");
  }

  cateClick() {
    const btns = [...document.querySelectorAll(".cate-item")];
    const ui = new UI();
    btns.map(item => {
      let cateName = item.innerHTML;
      item.addEventListener("click", event => {
        let productByCate = Storage.getProductsByCate(cateName);
        listProducts = productByCate;
        productTitle.innerHTML = cateName;
        ui.displayProducts(productByCate);
        this.hideCate();
      });
    });
  }
}

class Sort {
  selectBoxClick() {
    priceSelect.addEventListener("click", event => {
      let value = priceSelect.options[priceSelect.selectedIndex].value;
      if (value === "Lowest") {
        this.displayByPrice(this.LowestPrice, listProducts);
      } else if (value === "Highest") {
        this.displayByPrice(this.HighestPrice, listProducts);
      }
    });
  }

  displayByPrice(select, products) {
    const ui = new UI();
    products.sort(select);
    ui.displayProducts(products);
  }

  LowestPrice(product1, product2) {
    return product1.price - product2.price;
  }

  HighestPrice(product1, product2) {
    return product2.price - product1.price;
  }
}

//display products,cart,etc...
class UI {
  bannerClick(products) {
    logo.addEventListener("click", () => {
      this.displayProducts(products);
    });
  }

  displayProducts(products) {
    let result = "";
    products.forEach(product => {
      result += `
      <!-- single product -->
      <article class="product">
        <div class="img-container">
          <img src=${product.image} alt="product" class="product-img">
          <button class="bag-btn" data-id=${product.id}>
            <i class="fas fa-shopping-cart"></i>
            add to bag
          </button>
        </div>

        <h3>${product.title}</h3>
        <h4>$${product.price}</h4>
      </article>
      <!-- end of single product -->
      `;
    });

    productsDOM.innerHTML = result;
  }

  getBagButtons() {
    const btns = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = btns;
    btns.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = "in cart";
        button.disabled = true;
      }

      button.addEventListener("click", event => {
        event.target.innerText = "in Cart";
        event.target.disabled = true;

        // get product from products
        let cartItem = {
          ...Storage.getProducts(id),
          amount: 1
        };

        // add product to the cart
        cart = [...cart, cartItem];

        // save cart in local storage
        Storage.saveCart(cart);

        //set cart values
        this.setCartValues(cart);

        // display cart item
        this.addCartItem(cartItem);

        // show the cart
        this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;

    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });

    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
     <img src=${item.image} alt="product">
          <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
          </div>
          <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
          </div>
    `;
    cartContent.appendChild(div);
  }

  showCart() {
    const cate = new category();
    cate.hideCate();
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populate(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  populate(cart) {
    cart.forEach(item => this.addCartItem(item));
  }

  cartLogic() {
    //clear cart button
    var self = this;
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    // cart fuctionality
    cartContent.addEventListener("click", event => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);

        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class = "fas fa-shopping-cart"></i>add to cart`;
  }

  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}

//local storage
class Storage {
  static saveproducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getAllProducts() {
    const products = JSON.parse(localStorage.getItem("products"));

    return products;
  }

  static getProductsByCate(cate) {
    const products = JSON.parse(localStorage.getItem("products"));

    return products.filter(item => {
      return item.type === cate;
    });
  }

  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  const cate = new category();
  const sort = new Sort();

  container.addEventListener("click", event => {
    if (cateOverlay.classList.contains("transparentBcg")) {
      cate.hideCate();
    }
  });

  //set up  app
  ui.setupApp();

  //cate button
  cate.cateButton();

  // get all product
  products
    .getProducts()
    .then(item => {
      ui.bannerClick(item);
      ui.displayProducts(item);
      cate.displayCategory(item);
      Storage.saveproducts(item);
      sort.selectBoxClick(item);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
      cate.cateClick();
    });
});
