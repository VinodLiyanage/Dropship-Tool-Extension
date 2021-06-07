const log = console.log;

function injector(csvObjectArray, orderElementObjectArray) {
  function injectTrackingDetail(element, orderIndex, tracking) {
    if (!(element && element instanceof HTMLElement)) return;

    const TRACKING_INPUT_ID = `order(${orderIndex.trim()}).box(1).trackingnumber`;

    const inputTracking = document.getElementById(TRACKING_INPUT_ID);

    if (inputTracking && inputTracking instanceof HTMLElement) {
      inputTracking.value = tracking;
    } else return;
  }

  function injectShippingMethodDetail(element, orderIndex, deliveryCode) {
    if (!(element && element instanceof HTMLElement)) return;

    //* If carrierType =’GROUND_HOME DELIVERY’ Select ‘FedEx Ground’ from dropdown
    //* If carrrierType = ‘FEDEX_GROUND’ Select‘  SELECT ‘FedEx Home Delivery’ from dropdown

    const SHIPPING_SELECT_ID = `order(${orderIndex}).box(1).shippingmethod`;

    let SHIPPING_OPTION_ID = null;
    if (deliveryCode === "GROUND_HOME_DELIVERY") {
      //order(866503891).box(1).shippingmethod.FEDX

      SHIPPING_OPTION_ID = `order(${orderIndex}).box(1).shippingmethod.FEDX`;
    } else if (deliveryCode === "FEDEX_GROUND") {
      //order(866503891).box(1).shippingmethod.FEDH

      SHIPPING_OPTION_ID = `order(${orderIndex}).box(1).shippingmethod.FEDH`;
    } else {
      return;
    }
    const selectShipping = document.getElementById(SHIPPING_SELECT_ID);
    const optionShipping = document.getElementById(SHIPPING_OPTION_ID);
    if (
      selectShipping &&
      optionShipping &&
      selectShipping instanceof HTMLElement &&
      optionShipping instanceof HTMLElement
    ) {
      if (selectShipping.selectedIndex !== -1) {
        selectShipping.options[selectShipping.selectedIndex].removeAttribute(
          "selected"
        );
      }
      selectShipping.setAttribute("value", optionShipping.value);
      optionShipping.setAttribute("selected", "true");
    }
  }

  function orderDetailInjector(element, orderIndex) {
    if (!(element && element instanceof HTMLElement)) return;

    function injectShippingWarehouseDetail(idTag) {
      const SELECT_WAREHOUSE_ID = idTag + ".shippingLineWarehouse";
      const OPTION_WAREHOUSE_ID = idTag + ".shippingLineWarehouse.Sterling-VA";

      const selectShippingWarehouse =
        document.getElementById(SELECT_WAREHOUSE_ID);
      const optionShippingWarehouse =
        document.getElementById(OPTION_WAREHOUSE_ID);

      if (
        selectShippingWarehouse &&
        optionShippingWarehouse &&
        selectShippingWarehouse instanceof HTMLElement &&
        optionShippingWarehouse instanceof HTMLElement
      ) {
        if (selectShippingWarehouse.selectedIndex !== -1) {
          selectShippingWarehouse.options[
            selectShippingWarehouse.selectedIndex
          ].removeAttribute("selected");
        }
        selectShippingWarehouse.setAttribute(
          "value",
          optionShippingWarehouse.value
        );
        optionShippingWarehouse.setAttribute("selected", "true");
      }
    }

    function inject(){
        
    }

    const trArray = Array.from(
      element.querySelectorAll("table.fw_widget_table tbody tr[id]") || []
    );
    if (!(trArray && trArray)) return;

    trArray.forEach((tr) => {
      const id = tr.id;
      if (!id) return;

      let idTag;
      try {
        const re = /(?:row\.line\.)(.*\.item\(\d+\))?/gim;
        idTag = Array.from(re.exec(id) || [])[1];
      } catch (e) {
        console.error(e);
        return;
      }
      injectShippingWarehouseDetail(idTag);
    });
  }

  if (csvObjectArray && orderElementObjectArray) {
    csvObjectArray.forEach((csvObject, index) => {
      if (index > orderElementObjectArray.length - 1) {
        return;
      }

      const elementObject = orderElementObjectArray[index];
      const { element, orderId, orderIndex } = elementObject;
      const { orderID: csvOrderId, tracking, delivery_code } = csvObject;

      if (
        !(
          orderIndex &&
          tracking &&
          csvOrderId &&
          orderId &&
          element &&
          delivery_code
        )
      )
        return;

      if (orderId.trim() === csvOrderId.trim()) {
        injectTrackingDetail(element, orderIndex, tracking);
        injectShippingMethodDetail(element, orderIndex, delivery_code);
        orderDetailInjector(element, orderIndex);
      }
    });
  }
}

function getOrderQueue() {
  const orderForm = document.querySelector(
    'form[name="GeneralOrderRealmForm"][id="primaryForm"]'
  );
  if (!(orderForm && orderForm instanceof HTMLElement)) {
    console.error("orderForm not found!");
    return;
  }
  const orderElementArray = Array.from(
    orderForm.querySelectorAll(".fw_widget_windowtag")
  );
  const orderElementObjectArray = [];

  orderElementArray.forEach((elm) => {
    if (!(elm && elm instanceof HTMLElement)) return;

    const orderIdElement = elm.querySelector(
      "div.fw_widget_windowtag_topbar div.framework_fiftyfifty_left_justify span.no_emphasis_label a.simple_link"
    );
    if (!(orderIdElement && orderIdElement instanceof HTMLElement)) {
      console.error("orderIdElement not found!");
      return;
    }

    const orderId = (orderIdElement.innerText || "").trim();
    let orderIndex;
    try {
      const refIdFromPrevElement = (
        elm.previousElementSibling.value || ""
      ).trim();
      const refIdFromOrderElement = (orderIdElement.href || "")
        .split("Hub_PO=")[1]
        .trim();

      log(refIdFromPrevElement, refIdFromOrderElement);
      if (refIdFromPrevElement === refIdFromOrderElement) {
        orderIndex = refIdFromPrevElement;
      } else {
        orderIndex = refIdFromOrderElement;
      }
    } catch (e) {
      console.error(e);
    }

    orderElementObjectArray.push({
      element: elm,
      orderId,
      orderIndex,
    });
  });

  log("orderElementObjectArray", orderElementObjectArray);
  return orderElementObjectArray;
}

async function listener() {
  return new Promise((resolve, reject) => {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      sendResponse({ farewell: "goodbye" });

      const csvObjectArray = request.csvObjectArray.data;

      if (!(csvObjectArray && csvObjectArray.length)) {
        reject(false);
      } else {
        resolve(csvObjectArray);
      }

      return true;
    });
  });
}

(async () => {
  log("content script started!");
  const csvObjectArray = await listener();

  log("csvObjectArray in content scirpt", csvObjectArray);

  const orderElementObjectArray = getOrderQueue();
  injector(csvObjectArray, orderElementObjectArray);
})();
