$("#sidebar-toggler").click(function(e){

  e.stopPropagation();

  $("#sidebar").toggleClass("nav-open");
  $("#main").toggleClass("nav-open");
  $(".brand-text").toggleClass("nav-open");
  $(".sidebar-title").toggleClass("nav-open");
  $(".sidebar-brand").toggleClass("nav-open");
})

$(".projectToggler").click(function (e){
  e.stopPropagation();

   var cardBody = $(this).parent().parent().parent().parent().parent().parent().find('.card-body');
   cardBody.toggle();

   $(this).find('svg.chevron-up').toggle();
   $(this).find('svg.chevron-down').toggle();
})

$(".more").click(function (e){
  e.stopPropagation();

   var description = $(this).parent().parent().parent().parent().find('.projectDescription');
   description.toggle();

   $(this).find('svg.more-horizontal').toggle();
   $(this).find('svg.more-vertical').toggle();
})

$(".hideProject").click(function (e){
  e.stopPropagation();

   $(this).parent().parent().parent().parent().parent().parent().hide();
})

$(".form-btn").click(function (e) {
  e.stopPropagation();

  let formText = $(this).parent().parent().find('.form-input');
  let formAction = $(this).parent().parent().find('.submit-action');

  formText.removeClass('hide');

  formAction.removeClass('hide');

  $(this).addClass('hide');
});

// Set the clicked attribute to true for use to get the clicked button val
$("form input[type=submit]").click(function() {
    $("input[type=submit]", $(this).parents("form")).removeAttr("clicked");
    $(this).attr("clicked", "true");
});

$(".actions-form").submit(function (e) {

  var val = $("input[type=submit][clicked=true]").val();
  let formAction = $(this).attr('action');

  // TODO make sure that there is no other & in the url
  $(this).attr('action', `${formAction}&${val}=1`);
  return true;
});

/* Add event listener to set the URL query for statusFilter*/
var statusElement = document.getElementById("statusFilter");

if (statusElement) {
  statusElement.addEventListener('change', function() {
    let filter = this.value.toLowerCase();
    filter = filter.replace(/ /g,'');

    let url = window.location.href;
    if(url.indexOf(filter) > -1) {
      // Filter is not changed
      return;
    }

    if(url.indexOf('status') > -1) {
      url = url.replace(/status=[^&]+&*/,`status=${filter}`);
      // \A?var1=[^&]+&*
    } else {
        url = `${url}?status=${filter}`;
    }

    window.location.href = url;
  }, false);

}
