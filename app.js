// The last () before the ; means that these var is automatically invoked
// If the var/function asks for arguments, then the arguments should also be passed like this:
// (arg_1, arg_2);
var budgetController = (function() {

	var x = 23;

	var add = function(input) {
		return x + input;
	}

	// This method should return/give the public access to these methods
	return {
		publicTest: function(input) {
			return add(input);
		}
	}
})();


var uiController = (function() {

});


var appController = (function(budgetCtrl, uiCtrl) {

	var result = budgetCtrl.publicTest(5);

	return {
		anotherPublicTest: function() {
			console.log(result);
		}
	}

})(budgetController, uiController);