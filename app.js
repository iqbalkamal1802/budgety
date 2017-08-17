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

	// Public methods of budgetController object
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
		expensePercLabel: '.item__percentage',
		budgetDateLabel: '.budget__title--month',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage'
	};

	var	formatNumber = function(num, itemType) {
		// In this function what we want to do is to add decimal point
		// to the value of item, adding comma per thousands, and add plus or minus sign.
		var numSplit, int, dec, type;

		// Coerce the number to be absolute, no negative number
		num = Math.abs(num);

		// Also force to have at least 2 decimal numbers
		num = num.toFixed(2);

		// Split the number strings by the decimal point
		numSplit = num.split('.');

		// The integer must come from the first part of the split number
		int = numSplit[0];

		digits = int.length 
		// Now we want to insert comma to the integer part for each thousand points
		if (digits > 3) {
			// 23510 => 23,510 , 1500000 => 1,500,000
			int = int.substr(0, (digits - 3)) + ',' + int.substr((digits - 3), 3);
		}

		// get the decimal part of the number after split
		dec = numSplit[1];

		return (itemType === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
	};

	// Public methods of uiController object
	return {
		getInput: function() {
			// Just return JSON object
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		displayCurrentDate: function() {
			var now, year, month, monthIndex, monthList;

			now = new Date(); // get the date of today
			year = now.getFullYear();
			monthIndex = now.getMonth();
			monthList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

			document.querySelector(DOMstrings.budgetDateLabel).textContent = monthList[monthIndex]+ ' ' + year;
		},

		getDOMstrings: function() {
			return DOMstrings;
		},

		addItemToList: function(item, type) {
			var html, container;

			if (type === 'exp')  {
				container = DOMstrings.expenseContainer;
				html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value"> %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';				
			} else if (type === 'inc') {
				container = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value"> %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			var newHtml = html.replace('%id%', item.id);
			var newHtml = newHtml.replace('%description%', item.description);
			var newHtml = newHtml.replace('%value%', formatNumber(item.value, type));

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

		displayPercentages: function(percentages) {

			var fields = document.querySelectorAll(DOMstrings.expensePercLabel);

			// A custom method to be able iterate nodeList like an array
			var nodeListForEach = function(list, callbackFunction) {
				for (var i = 0; i < list.length; i++) {
					callbackFunction(list[i], i);
				}
			};

			nodeListForEach(fields, function(current, index) {
				// We now loop the node lists containing all the element with the class of .item__percentage
				// and assign content to each of them
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});
		},

		// This public method is for displaying the totals on the UI side, should be triggered during 
		// starting up and after making input
		displayBudget: function(budgetObject) {
			var budgetState;
			budgetObject.budget > 0 ? budgetState = 'inc' : budgetState = 'exp';

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(budgetObject.budget, budgetState);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(budgetObject.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(budgetObject.totalExp, 'exp');

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
		uiCtrl.displayPercentages(percentages);
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
			uiCtrl.displayCurrentDate();
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