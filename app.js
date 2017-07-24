// The last () before the ; means that these var is automatically invoked
// If the var/function asks for arguments, then the arguments should also be passed like this:
// (arg_1, arg_2);
var budgetController = (function() {

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		}
	};
	

	return {
		addItem: function(type, desc, val) {
			var newItem, ID;

			var itemsCount = data.allItems[type].length;

			// We want to generate the correct ID.
			// If there is no item yet, start from 1. But if there exists another items, then
			// we need to get the latest ID (from the last element in the array) then increment it by 1
			if (itemsCount === 0) {
				ID = 1;
			} else {
				// We need to deduct itemsCount with 1 because array index starts from 0.
				ID = data.allItems[type][itemsCount - 1].id + 1;
			}


			if (type === 'exp') {
				newItem = new Expense(ID, desc, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, desc, val);
			}

			// As type can be either 'exp' or 'inc', which matches
			// with the json key inside the allItems, we can directly use it this way:
			data.allItems[type].push(newItem);

			return newItem;
		}
	};
})();


var uiController = (function() {

	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputSubmit: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list'
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
		},

		addItemToList: function(item, type) {
			var html, container;

			if (type === 'exp')  {
				container = DOMstrings.expenseContainer;
				html = '<div class="item clearfix" id="%id%"> <div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';				
			} else if (type === 'inc') {
				container = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="%id%"><div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			var newHtml = html.replace('%id%', item.id);
			var newHtml = newHtml.replace('%description%', item.description);
			var newHtml = newHtml.replace('%value%', item.value);

			document.querySelector(container).insertAdjacentHTML('beforeend', newHtml);
		},

		clearFields: function() {
			var fields, fieldsArr;

			// Get all the fields object that is in the form of list, not array
			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
			// Turn the list into an array by using slice method from Array prototype
			fieldsArr = Array.prototype.slice.call(fields);

			// Set the value of each input to empty
			fieldsArr.forEach(function(current, index, array) {
				current.value = '';
			})

			// Automatically focus to the description field 
			fieldsArr[0].focus();
		}
	};
})();


var appController = (function(budgetCtrl, uiCtrl) {

	// Group all event listeners in this function
	var setupEventListeners = (function() {
		var DOMstrings = uiCtrl.getDOMstrings();

		document.querySelector(DOMstrings.inputSubmit).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event) {
			if (event.key === "Enter" || event.which === 13) {
				ctrlAddItem();
			}
		});
	})

	var updateBudget = (function() {
		// 1. Calculate the budget
		// 2. Return the budget
		// 3. Update the display of the budget
	})

	// The hook that process input and adds item to the UI
	var ctrlAddItem = (function() {
		var input, newItem;

		// 1. Get the input
		input = uiCtrl.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			// 2. Process the data
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// 3. Add the newItem in the UI to show the changes inputted
			uiCtrl.addItemToList(newItem, input.type);
			uiCtrl.clearFields();

			// 4. Update budget
			updateBudget();
		}
	})

	return {		
		init: function() {
			console.log('Application has started');
			setupEventListeners();
		}
	};
})(budgetController, uiController);

appController.init();