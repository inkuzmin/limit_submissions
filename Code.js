function onOpen(e) {
  FormApp.getUi()
      .createAddonMenu()
      .addItem('Configure', 'showSidebar')
      .addToUi();
}

function onInstall(e) {
  onOpen(e);
}

function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle('Limit Submissions');
  FormApp.getUi().showSidebar(ui);
}

function saveSettings(settings) {
  PropertiesService.getDocumentProperties().setProperties(settings);

  deleteTriggers();

  if (settings.enable) {
    createTrigger();
    removeBanner();
    createBanner();
  } else {
    removeBanner();
  }
}


function getSettings() {
  return PropertiesService.getDocumentProperties().getProperties();
}


function createTrigger() {
  var form = FormApp.getActiveForm();
  ScriptApp.newTrigger('checkLimit')
      .forForm(form)
      .onFormSubmit()
      .create();
}

function deleteTriggers() {
  var form = FormApp.getActiveForm();
  var triggers = ScriptApp.getUserTriggers(form);

  triggers.forEach(function(trigger){
    if (trigger.getEventType() == ScriptApp.EventType.ON_FORM_SUBMIT) {
      try {
        ScriptApp.deleteTrigger(trigger);
      } catch(e) {
        throw e.message;
      };
    }
  });
}


function createBanner() {
  var settings = getSettings();
  var form = FormApp.getActiveForm();
  var item = form.addSectionHeaderItem();

  item.setTitle('‎Already registered: ' + FormApp.getActiveForm().getResponses().length + ' out of ' + Math.round(settings.limit));
  form.moveItem(item.getIndex(), 0);
}

function removeBanner() {
  var form = FormApp.getActiveForm();

  var items = form.getItems(FormApp.ItemType.SECTION_HEADER);
  for (var i = 0; i < items.length; i++) {
    var item = items[i];

    if (item.getTitle().indexOf('‎') > -1) {
      form.deleteItem(item.getIndex());
    }
  }
}

function openForm() {
  var form = FormApp.getActiveForm();

  form.setAcceptingResponses(true);

  removeBanner();
  createBanner();
}

function closeForm() {
  var form = FormApp.getActiveForm();
  var msg = form.getCustomClosedFormMessage() || "We're sorry! We have reached our maximum number of participants.";

  form.setCustomClosedFormMessage(msg)
      .setAcceptingResponses(false);
}

function checkLimit() {
  var settings = getSettings();

  if (FormApp.getActiveForm().getResponses().length >= settings.limit) {
    if (settings.automaticallyClose) {
      closeForm();
    }
  }  else {
    openForm();
  }
}
