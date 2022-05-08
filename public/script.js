(() => {
  generateOption();
  selectionOption();
  removeClass();
  var way = 0;
  var li = $(".ways li");
  var section = $(".sections section");
  var index = 0;
  var temp_option;
  li.on("click", function() {
    index = $(this).index();
    $(this).addClass("active");
    $(this)
      .siblings()
      .removeClass("active");

    section.siblings().removeClass("active");
    section.eq(index).addClass("active");
    if (!way) {
      way = 1;
    } else {
      way = 0;
    }
  });

  function generateOption() {
    var select = $("select option");
    var selectAdd = $(".select-option .option");
    $.each(select, function(i, val) {
      temp_option =
        '<div rel="' + $(val).val() + '">' + $(val).html() + "</div>";
      $(".select-option .option").append(temp_option);
    });
  }

  function selectionOption() {
    var select = $(".select-option .head");
    var option = $(".select-option .option div");

    select.on("click", function(event) {
      event.stopPropagation();
      $(".select-option").addClass("active");
    });

    option.on("click", function() {
      var value = $(this).attr("rel");
      $(".select-option").removeClass("active");
      select.html("Permission: " + value);

      $("select#perm").val(value);
    });

    if (temp_option) $(temp_option).click();
  }

  function removeClass() {
    $("body").on("click", function() {
      $(".select-option").removeClass("active");
    });
  }
})();

$("#logout").on("click", () => {
  window.location.href = "/logout";
});

$("#login").on("click", () => {
  window.location.href = "/auth";
});

var form1 = document.querySelector("#attacker-form");
form1.onsubmit = function(event) {
  var form = form1;
  event.preventDefault();

  fetch("/attack", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({
      proxys: form
        .querySelector("#proxy")
        .value.split("\n")
        .map(e => e.trim()),
      link: form.querySelector("#link").value,
      delay: Number(form.querySelector("#delay").value)
    })
  })
    .then(e => e.json())
    .then(res => {
      if (res.status == 200) {
        Swal.fire("İşlem Başarılı!", res.message, "success");
      } else {
        Swal.fire("İşlem Başarısız!", res.message, "error");
      }
    });
};
var form2 = document.querySelector("#new-admin-form");
form2.onsubmit = function(event) {
  var form = form2;
  event.preventDefault();

  fetch("/new-admin", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({
      userID: form.querySelector("#userID").value,
      permLevel: form.querySelector("#perm").value
    })
  })
    .then(e => e.json())
    .then(res => {
      if (res.status == 200) {
        Swal.fire("İşlem Başarılı!", res.message, "success");
        setTimeout(() => location.reload(), 1000);
      } else {
        Swal.fire("İşlem Başarısız!", res.message, "error");
      }
    });
};

function removeAdmin(userID) {
  fetch("/remove-admin", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({
      userID
    })
  })
    .then(e => e.json())
    .then(res => {
      if (res.status == 200) {
        Swal.fire("İşlem Başarılı!", res.message, "success");
        setTimeout(() => location.reload(), 1000);
      } else {
        Swal.fire("İşlem Başarısız!", res.message, "error");
      }
    });
}
