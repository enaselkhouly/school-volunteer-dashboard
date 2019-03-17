

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

  var formText = $(this).parent().parent().find('.form-input');
  var formAction = $(this).parent().parent().find('.submit-action');

  formText.removeClass('hide');

  formAction.removeClass('hide');

  $(this).addClass('hide');
});

// Set the clicked attribute to true for use to get the clicked button val
$("form input[type=submit]").click(function() {
    $("input[type=submit]", $(this).parents("form")).removeAttr("clicked");
    $(this).attr("clicked", "true");
});

$(".form-actions").submit(function (e) {

  var val = $("input[type=submit][clicked=true]").val();
  var formAction = $(this).attr('action');

  $(this).attr('action', `${formAction}?_method=PUT&${val}=1`);

  return true;
});


/* Date and time picker*/
// Datepicker Popups calender to Choose date.
flatpickr('#date-picker', {
                            altInput: true,
                            altFormat: "F j, Y",
                            dateFormat: 'm/d/Y',
                            // today
                            minDate: "today",
                            allowInput: true,
                            disableMobile: true
                          });
flatpickr('#to-date-picker', {
                            dateFormat: 'm/d/Y',
                            // today
                            minDate: new Date(),
                          });
flatpickr('#from-time', {
                          enableTime: true,
                          noCalendar: true,
                          dateFormat: "H:i",
                          allowInput: true,
                          defaultHour: 14,
                          defaultMinute: 45,
                          disableMobile: true
                        });
flatpickr('#to-time', { enableTime: true,
                        noCalendar: true,
                        dateFormat: "H:i",
                        allowInput: true,
                        disableMobile: true
                      });

/**
* Filters
*/

$("#filter").click( function (e) {
  $(this).parent().find('.hide').toggle();
});

$("#filter-submit").click(function (e) {

  let url = window.location.href;

  $('.categoryCheckBox:checkbox').each( function () {
    const filter = $(this).attr('name');

    if ($(this).is(':checked')) {
      // Add the filter if it was not added before
      if (url.indexOf(`${filter}`) <= -1) {
        if(url.indexOf('?') > -1) {
            url = `${url}&category=${filter}`;
          } else {
            url = `${url}?category=${filter}`;
          }
      }
    } else {
       // Remove the filter if it became unchecked
       if (url.indexOf(`&category=${filter}`) > -1) {
         url = url.replace(`&category=${filter}`,"");
       }
       // This will match when the query after the '?'
       else if (url.indexOf(`category=${filter}`) > -1){
         url = url.replace(`category=${filter}`,"");
       }
       // remove the ? if this is the last query
       let parts;
       if(url.indexOf('?') > -1) {
         parts = url.split('?');
         if (!parts[1]) {
           url = url.replace("?", "");
         }
       }
     }
  });

  // Filter by status
  $('.statusCheckBox:checkbox').each( function () {
    const filter = $(this).attr('name');

    if ($(this).is(':checked')) {

      // Add the filter if it was not added before
      if (url.indexOf(`${filter}`) <= -1) {
        if(url.indexOf('?') > -1) {
            url = `${url}&status=${filter}`;
          } else {
            url = `${url}?status=${filter}`;
          }
      }
    } else {
      // Remove the filter if it became unchecked
      if (url.indexOf(`&status=${filter}`) > -1) {
        url = url.replace(`&status=${filter}`,"");
      }
      // This will match when the query after the '?'
      else if (url.indexOf(`status=${filter}`) > -1){
        url = url.replace(`status=${filter}`,"");
      }
      // remove the ? if this is the last query
      let parts;
      if(url.indexOf('?') > -1) {
        parts = url.split('?');
        if (!parts[1]) {
          url = url.replace("?", "");
        }
      }
    }
  });

  // Filter by PTA
  $('.ptaCheckBox:checkbox').each( function () {
    const filter = $(this).attr('name');

    if ($(this).is(':checked')) {

      // Add the filter if it was not added before
      if (url.indexOf(`${filter}`) <= -1) {
        if(url.indexOf('?') > -1) {
            url = `${url}&pta=${filter}`;
          } else {
            url = `${url}?pta=${filter}`;
          }
      }
    } else {
      // Remove the filter if it became unchecked
      if (url.indexOf(`&pta=${filter}`) > -1) {
        url = url.replace(`&pta=${filter}`,"");
      }
      // This will match when the query after the '?'
      else if (url.indexOf(`pta=${filter}`) > -1){
        url = url.replace(`pta=${filter}`,"");
      }
      // remove the ? if this is the last query
      let parts;
      if(url.indexOf('?') > -1) {
        parts = url.split('?');
        if (!parts[1]) {
          url = url.replace("?", "");
        }
      }
    }
  });
  window.location.href = url;
});

/*
* Form validation
*/

// Add the novalidate attribute when the JS loads
const forms = document.querySelectorAll('.validate');
for (let i = 0; i < forms.length; i++) {
    forms[i].setAttribute('novalidate', true);
}


// Validate the field
const hasError = function (field) {

    // Don't validate submits, buttons, file and reset inputs, and disabled fields
    if (field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') return;

    // Get validity
    const validity = field.validity;

    // If valid, return null
    if (validity.valid) return;

    // If field is required and empty
    if (validity.valueMissing) return 'Please fill out this field.';

    // If not the right type
    if (validity.typeMismatch) {

        // Email
        if (field.type === 'email') return 'Please enter an email address.';

        // URL
        if (field.type === 'url') return 'Please enter a URL.';

    }

    // If too short
    if (validity.tooShort) return 'Please lengthen this text to ' + field.getAttribute('minLength') + ' characters or more. You are currently using ' + field.value.length + ' characters.';

    // If too long
    if (validity.tooLong) return 'Please shorten this text to no more than ' + field.getAttribute('maxLength') + ' characters. You are currently using ' + field.value.length + ' characters.';

    // If number input isn't a number
    if (validity.badInput) return 'Please enter a number.';

    // If a number value doesn't match the step interval
    if (validity.stepMismatch) return 'Please select a valid value.';

    // If a number field is over the max
    if (validity.rangeOverflow) return 'Please select a value that is no more than ' + field.getAttribute('max') + '.';

    // If a number field is below the min
    if (validity.rangeUnderflow) return 'Please select a value that is no less than ' + field.getAttribute('min') + '.';

      // If pattern doesn't match
    if (validity.patternMismatch) {

        // If pattern info is included, return custom error
        if (field.hasAttribute('title')) return field.getAttribute('title');

        // Otherwise, generic error
        return 'Please match the requested format.';

    }

    // If all else fails, return a generic catchall error
    return 'The value you entered for this field is invalid.';

};


// Show an error message
const showError = function (field, error) {

    // Add error class to field
    field.classList.add('error');

    // If the field is a radio button and part of a group, error all and get the last item in the group
    if (field.type === 'radio' && field.name) {
        const group = document.getElementsByName(field.name);
        if (group.length > 0) {
            for (let i = 0; i < group.length; i++) {
                // Only check fields in current form
                if (group[i].form !== field.form) continue;
                group[i].classList.add('error');
            }
            field = group[group.length - 1];
        }
    }

    // Get field id or name
    const id = field.id || field.name;
    if (!id) return;

    // Check if error message field already exists
    // If not, create one
    let message = field.form.querySelector('.error-message#error-for-' + id );
    if (!message) {
        message = document.createElement('div');
        message.className = 'error-message';
        message.id = 'error-for-' + id;

        // If the field is a radio button or checkbox, insert error after the label
        let label;
        if (field.type === 'radio' || field.type ==='checkbox') {
            label = field.form.querySelector('label[for="' + id + '"]') || field.parentNode;
            if (label) {
                label.parentNode.insertBefore( message, label.nextSibling );
            }
        }

        // Otherwise, insert it after the field
        if (!label) {
            field.parentNode.insertBefore( message, field.nextSibling );
        }

    }

    // Add ARIA role to the field
    field.setAttribute('aria-describedby', 'error-for-' + id);

    // Update error message
    message.innerHTML = error;

    // Show error message
    message.style.display = 'block';
    message.style.visibility = 'visible';

};


// Remove the error message
const removeError = function (field) {

    // Remove error class to field
    field.classList.remove('error');

    // Remove ARIA role from the field
    field.removeAttribute('aria-describedby');

    // If the field is a radio button and part of a group, remove error from all and get the last item in the group
    if (field.type === 'radio' && field.name) {
        const group = document.getElementsByName(field.name);
        if (group.length > 0) {
            for (let i = 0; i < group.length; i++) {
                // Only check fields in current form
                if (group[i].form !== field.form) continue;
                group[i].classList.remove('error');
            }
            field = group[group.length - 1];
        }
    }

    // Get field id or name
    const id = field.id || field.name;
    if (!id) return;


    // Check if an error message is in the DOM
    const message = field.form.querySelector('.error-message#error-for-' + id + '');
    if (!message) return;

    // If so, hide it
    message.innerHTML = '';
    message.style.display = 'none';
    message.style.visibility = 'hidden';

};


// Listen to all blur events
document.addEventListener('blur', function (event) {

    // Only run if the field is in a form to be validated
    if (!event.target.form || !event.target.form.classList || !event.target.form.classList.contains('validate')) return;

    // Validate the field
    const error = hasError(event.target);

    // If there's an error, show it
    if (error) {
        showError(event.target, error);
        return;
    }

    // Otherwise, remove any existing error message
    removeError(event.target);

}, true);


// Check all fields on submit
document.addEventListener('submit', function (event) {

    // Only run on forms flagged for validation
    if (!event.target.classList.contains('validate')) return;

    // Get all of the form elements
    const fields = event.target.elements;

    // Validate each field
    // Store the first field with an error to a variable so we can bring it into focus later
    let error, hasErrors;
    for (let i = 0; i < fields.length; i++) {
        error = hasError(fields[i]);
        if (error) {
            showError(fields[i], error);
            if (!hasErrors) {
                hasErrors = fields[i];
            }
        }
    }

    // If there are errrors, don't submit form and focus on first element with error
    if (hasErrors) {
        event.preventDefault();
        hasErrors.focus();
    }

    // Otherwise, let the form submit normally
    // You could also bolt in an Ajax form submit process here

}, false);
