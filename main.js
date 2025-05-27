(function ($) {
  "use strict";

  new WOW().init();

  $(".cart_link > a").on("click", function () {
    $(".mini_cart").addClass("active");
  });

  $(".mini_cart_close > a").on("click", function () {
    $(".mini_cart").removeClass("active");
  });

  $(window).on("scroll", function () {
    var scroll = $(window).scrollTop();
    if (scroll < 100) {
      $(".sticky-header").removeClass("sticky");
    } else {
      $(".sticky-header").addClass("sticky");
    }
  });

  function dataBackgroundImage() {
    $("[data-bgimg]").each(function () {
      var bgImgUrl = $(this).data("bgimg");
      $(this).css({
        "background-image": "url(" + bgImgUrl + ")",
      });
    });
  }

  $(window).on("load", function () {
    dataBackgroundImage();
  });

  $(".slider_area").owlCarousel({
    animateOut: "fadeOut",
    autoplay: true,
    loop: true,
    nav: false,
    autoplayTimeout: 6000,
    items: 1,
    dots: true,
  });

  $(".product_column3").slick({
    centerMode: true,
    centerPadding: "0",
    slidesToShow: 5,
    arrows: true,
    rows: 2,
    prevArrow:
      '<button class="prev_arrow"><i class="ion-chevron-left"></i></button>',
    nextArrow:
      '<button class="next_arrow"><i class="ion-chevron-right"></i></button>',
    responsive: [
      { breakpoints: 400, settings: { slidesToShow: 1, slidesToScroll: 1 } },
      { breakpoints: 768, settings: { slidesToShow: 2, slidesToScroll: 2 } },
      { breakpoints: 992, settings: { slidesToShow: 3, slidesToScroll: 3 } },
      { breakpoints: 1200, settings: { slidesToShow: 4, slidesToScroll: 4 } },
    ],
  });

  $('[data-toggle="tooltip"]').tooltip();

  $(".product_navactive").owlCarousel({
    autoplay: false,
    loop: true,
    nav: true,
    items: 4,
    dots: false,
    navText: [
      '<i class="ion-chevron-left arrow-left"></i>',
      '<i class="ion-chevron-right arrow-right"></i>',
    ],
    responsiveClass: true,
    responsive: {
      0: { items: 1 },
      250: { items: 2 },
      480: { items: 3 },
      768: { items: 4 },
    },
  });

  $(".modal").on("shown.bs.modal", function () {
    $(".product_navactive").resize();
  });

  $(".product_navactive a").on("click", function (e) {
    e.preventDefault();
    var $href = $(this).attr("href");
    $(".product_navactive a").removeClass("active");
    $(this).addClass("active");
    $(".product-details-large .tab-pane").removeClass("active show");
    $(".product-details-large " + $href).addClass("active show");
  });

  // ---------------------------------
  // 🛒 CARRITO COMPLETO CON LOCALSTORAGE Y TOAST
  // ---------------------------------

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  updateCartDisplay();

  $(".add_to_cart a").on("click", function (e) {
    e.preventDefault();
    const product = $(this).closest(".single_product");
    const name = product.find("h3 a").text();
    const price = product.find(".current_price").text();
    const img = product.find(".primary_img img").attr("src");

    const existingIndex = cart.findIndex((item) => item.name === name);
    if (existingIndex !== -1) {
      cart[existingIndex].qty++;
    } else {
      const unitPrice = parseFloat(price.replace(/[^0-9.-]+/g, ""));
      cart.push({ name, img, unitPrice, qty: 1 });
    }
    updateCartDisplay();
    showToast(`${name} agregado al carrito`);
  });

  function updateCartDisplay() {
    const cartContainer = $(".mini_cart");
    const cartItemsHtml = cart
      .map(
        (item, index) => `
      <div class="cart_item" data-index="${index}">
        <div class="cart_img">
          <a href="#"><img src="${item.img}" alt="${item.name}"></a>
        </div>
        <div class="cart_info">
          <a href="#">${item.name}</a>
          <div class="quantity_controls">
            <button class="qty_minus" data-index="${index}">−</button>
            <span class="quantity"> ${item.qty} </span>
            <button class="qty_plus" data-index="${index}">+</button>
          </div>
          <span class="price_cart">Rs. ${(item.qty * item.unitPrice).toLocaleString()}</span>
        </div>
        <div class="cart_remove">
          <a href="#" class="remove_item" data-index="${index}"><i class="ion-android-close"></i></a>
        </div>
      </div>`
      )
      .join("");

    cartContainer.find(".cart_item").remove();
    cartContainer.find(".cart_total").before(cartItemsHtml);

    let subtotal = cart.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
    cartContainer.find(".cart_total span:last-child").text("Rs. " + subtotal.toLocaleString());

    $(".cart_quantity").text(cart.reduce((sum, item) => sum + item.qty, 0));

    localStorage.setItem("cart", JSON.stringify(cart));

    $(".remove_item").off("click").on("click", function (e) {
      e.preventDefault();
      const index = $(this).data("index");
      cart.splice(index, 1);
      updateCartDisplay();
    });

    $(".qty_plus").off("click").on("click", function () {
      const index = $(this).data("index");
      cart[index].qty++;
      updateCartDisplay();
    });

    $(".qty_minus").off("click").on("click", function () {
      const index = $(this).data("index");
      cart[index].qty--;
      if (cart[index].qty <= 0) cart.splice(index, 1);
      updateCartDisplay();
    });
  }

  $(".view_cart a").on("click", function (e) {
    e.preventDefault();
    let message = "🛍️ Productos en tu carrito:\n\n";
    cart.forEach((item, i) => {
      message += `${i + 1}. ${item.name} - Cant: ${item.qty} - Rs. ${(item.qty * item.unitPrice).toLocaleString()}\n`;
    });
    if (cart.length === 0) message = "Tu carrito está vacío.";
    alert(message);
  });

  $(".checkout a").on("click", function (e) {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Tu carrito está vacío. Agrega productos antes de finalizar la compra.");
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.qty * item.unitPrice, 0).toLocaleString();
    alert(`✅ Compra realizada con éxito.\n\nTotal: Rs. ${total}\nGracias por tu compra 💎`);

    cart = [];
    localStorage.removeItem("cart");
    updateCartDisplay();
    $(".mini_cart").removeClass("active");
  });

  // -------------------------------
  // ✅ TOAST DE PRODUCTO AGREGADO
  // -------------------------------
  function showToast(message) {
    let toast = $(`<div class="cart_toast">${message}</div>`);
    $("body").append(toast);
    setTimeout(() => {
      toast.addClass("show");
    }, 10);
    setTimeout(() => {
      toast.removeClass("show");
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
})(jQuery);

// 🌐 Idiomas disponibles
const traducciones = {
  es: {
    view_cart: "Ver Carrito",
    checkout: "Finalizar Compra",
    empty_cart: "Tu carrito está vacío.",
    success: "✅ Compra realizada con éxito.",
    thanks: "Gracias por tu compra 💎",
    qty: "Cant:"
  },
  en: {
    view_cart: "View Cart",
    checkout: "Checkout",
    empty_cart: "Your cart is empty.",
    success: "✅ Purchase completed successfully.",
    thanks: "Thank you for your purchase 💎",
    qty: "Qty:"
  }
};

// Moneda por defecto
let currentCurrency = localStorage.getItem("currency") || "Rs.";
let currentLang = localStorage.getItem("lang") || "es";

// Aplicar traducción
function applyTranslation() {
  const t = traducciones[currentLang];
  $(".view_cart a").text(t.view_cart);
  $(".checkout a").text(t.checkout);
}

// Cambiar idioma
$(".dropdown_language a").on("click", function (e) {
  e.preventDefault();
  const lang = $(this).data("lang");
  currentLang = lang;
  localStorage.setItem("lang", lang);
  applyTranslation();
  updateCartDisplay();
});

// Cambiar moneda
$(".dropdown_currency a").on("click", function (e) {
  e.preventDefault();
  const currency = $(this).data("currency");
  currentCurrency = currency;
  localStorage.setItem("currency", currency);
  updateCartDisplay();
});

// Traducción y moneda en carrito
function updateCartDisplay() {
  const cartContainer = $(".mini_cart");
  const t = traducciones[currentLang];

  const cartItemsHtml = cart
    .map(
      (item, index) => `
      <div class="cart_item" data-index="${index}">
        <div class="cart_img">
          <a href="#"><img src="${item.img}" alt="${item.name}"></a>
        </div>
        <div class="cart_info">
          <a href="#">${item.name}</a>
          <div class="quantity_controls">
            <button class="qty_minus" data-index="${index}">−</button>
            <span class="quantity"> ${item.qty} </span>
            <button class="qty_plus" data-index="${index}">+</button>
          </div>
          <span class="price_cart">${currentCurrency} ${(item.qty * item.unitPrice).toLocaleString()}</span>
        </div>
        <div class="cart_remove">
          <a href="#" class="remove_item" data-index="${index}"><i class="ion-android-close"></i></a>
        </div>
      </div>`
    )
    .join("");

  cartContainer.find(".cart_item").remove();
  cartContainer.find(".cart_total").before(cartItemsHtml);

  let subtotal = cart.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  cartContainer.find(".cart_total span:last-child").text(currentCurrency + " " + subtotal.toLocaleString());

  $(".cart_quantity").text(cart.reduce((sum, item) => sum + item.qty, 0));
  localStorage.setItem("cart", JSON.stringify(cart));

  // Reasignar eventos
  $(".remove_item").off("click").on("click", function (e) {
    e.preventDefault();
    const index = $(this).data("index");
    cart.splice(index, 1);
    updateCartDisplay();
  });

  $(".qty_plus").off("click").on("click", function () {
    const index = $(this).data("index");
    cart[index].qty++;
    updateCartDisplay();
  });

  $(".qty_minus").off("click").on("click", function () {
    const index = $(this).data("index");
    cart[index].qty--;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    updateCartDisplay();
  });

  applyTranslation(); // aplicar traducción al actualizar
}

// Aplicar al cargar
applyTranslation();
