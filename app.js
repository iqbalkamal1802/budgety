// The last () before the ; means that these var is automatically invoked
// If the var/function asks for arguments, then the arguments should also be passed like this:
// (arg_1, arg_2);
var budgetController = (function() {


})();


var uiController = (function() {

	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputSubmit: '.add__btn'
	};

	return {
		getInput: function() {
			// Just return JSON object
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: document.querySelector(DOMstrings.inputValue).value
			};
		},
		getDOMstrings: function() {
			return DOMstrings;
		}
	};
})();


var appController = (function(budgetCtrl, uiCtrl) {

	var setupEventListeners = (function() {
		var DOMstrings = uiCtrl.getDOMstrings();

		document.querySelector(DOMstrings.inputSubmit).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event) {
			if (event.key === "Enter" || event.which === 13) {
				ctrlAddItem();
			}
		});
	})

	var ctrlAddItem = (function() {

		// 1. Get the input
		var input = uiCtrl.getInput();
		console.log(input);

	})

	return {		
		init: function() {
			console.log('Application has started');
			setupEventListeners();
		}
	};
})(budgetController, uiController);

appController.init();