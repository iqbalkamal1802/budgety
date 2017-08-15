// The last () before the ; means that these var is automatically invoked
// If the var/function asks for arguments, then the arguments should also be passed like this:
// (arg_1, arg_2);
var budgetController = (function() {

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome){
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		}
	}

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	}

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
		},
		budget: 0,
		percentage: -1
	};
	

	var calculateTotal = function(type) {
		var sum = 0;
		var items_array = data.allItems[type];

		items_array.forEach(function(current, index, array) {
			sum = sum + current.value;
		})

		// Store the result on totals JSON object
		data.totals[type] = sum;
	}

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
		},

		deleteItem: function(type, id) {
			var ids = data.allItems[type].map(function(current, index, array) {
				return current.id;
			})

			var index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: function() {
			// Calc total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			// Calc the budget: tot.income - tot.expense
			data.budget = data.totals.inc - data.totals.exp;

			// Calc the percentage spent of income
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},

		calculatePercentages: function() {
			var totalIncome = data.totals.inc;

			data.allItems.exp.forEach(function(curr, index, arr) {
				curr.calcPercentage(totalIncome);
			});
		},

		getPercentages: function() {
			var allPerc = data.allItems.exp.map(function(curr, i, arr) {
				return curr.getPercentage();
			});

			return allPerc;
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},

		testing: function() {
			console.log(data);
		}
	};
})();


var uiController = (function() {

	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputSubmit: '.add__btn',
		parentContainer: '.container',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage'
	};

	return {
		getInput: function() {
			// Just return JSON object
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		getDOMstrings: function() {
			return DOMstrings;
		},

		addItemToList: function(item, type) {
			var html, container;

			if (type === 'exp')  {
				container = DOMstrings.expenseContainer;
				html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';				
			} else if (type === 'inc') {
				container = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			var newHtml = html.replace('%id%', item.id);
			var newHtml = newHtml.replace('%description%', item.description);
			var newHtml = newHtml.replace('%value%', item.value);

			document.querySelector(container).insertAdjacentHTML('beforeend', newHtml);
		},

		removeItemFromList: function(selectorId) {
			var el = document.getElementById(selectorId);

			el.parentNode.removeChild(el);
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
		},

		// This public method is for displaying the totals on the UI side, should be triggered during 
		// starting up and after making input
		displayBudget: function(budgetObject) {
			document.querySelector(DOMstrings.budgetLabel).textContent = budgetObject.budget;
			document.querySelector(DOMstrings.incomeLabel).textContent = budgetObject.totalInc;
			document.querySelector(DOMstrings.expensesLabel).textContent = budgetObject.totalExp;

			if (budgetObject.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = budgetObject.percentage + "%";
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		}
	};
})();


var appController = (function(budgetCtrl, uiCtrl) {

	// Group all event listeners in this function
	var setupEventListeners = (function() {
		var DOMstrings = uiCtrl.getDOMstrings();

		document.querySelector(DOMstrings.inputSubmit).addEventListener('click', ctrlAddItem);

		// This waits for event in which user press the submit button or enter button on keyboard
		// for adding item
		document.addEventListener('keypress', function(event) {
			if (event.key === "Enter" || event.which === 13) {
				ctrlAddItem();
			}
		});

		// This waits for user clicking on delete button to remove item
		document.querySelector(DOMstrings.parentContainer).addEventListener('click', ctrlDeleteItem);
	})

	var updateBudget = (function() {
		// 1. Calculate the budget
		budgetCtrl.calculateBudget();

		// 2. Return the budget
		var budget = budgetCtrl.getBudget();

		// 3. Update the display of the budget
		uiCtrl.displayBudget(budget);
	})

	var updatePercentages = function() {
		// Calculate the percentages of each item
		budgetCtrl.calculatePercentages();

		// Retrieve the percentages as an array
		var percentages = budgetCtrl.getPercentages();

		// Update the UI to match the latest data of percentages
		console.log(percentages);
	}

	// The hook that process input and adds item to the UI
	var ctrlAddItem = function() {
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

			// Update each of the expense items percentage
			updatePercentages();			
		}
	}

	var ctrlDeleteItem = function(event) {
		var targetContainerID, splitContainerID, type, ID;

		targetContainerID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (targetContainerID) {
			// We want to get the type of item that the user wants to remove, 
			// i.e. the item that user clicks to delete
			splitContainerID = targetContainerID.split('-');
			type = splitContainerID[0];
			ID = parseInt(splitContainerID[1]);

			// Delete from data structure that stores all data inputted
			budgetCtrl.deleteItem(type, ID);

			// Remove the item from the list
			uiCtrl.removeItemFromList(targetContainerID);

			// Update the budget
			updateBudget();

			// Update each of the expense items percentage
			updatePercentages();
		}
	}

	return {		
		init: function() {
			console.log('Application has started');
			uiCtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
		}
	};
})(budgetController, uiController);

appController.init();