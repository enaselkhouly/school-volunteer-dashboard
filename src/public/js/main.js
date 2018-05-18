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
