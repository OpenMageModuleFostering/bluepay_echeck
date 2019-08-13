var socket = '';

function iframeSocket(url) {
    socket = new easyXDM.Socket({
    remote: url,
    container: document.getElementById("container"),
    onMessage: function(message, origin){
	if (message != "ERROR")
	    bluepay.save(message);
	else
	    checkout.setLoadWaiting(false);
    },
    onReady: function() {
    }
});
}

function process() {
    checkReview();
    socket.postMessage("Submit form");
}

function checkLuhn(input) {
    var sum = 0; 
    var numdigits = input.length; 
    var parity = numdigits % 2; 
    for(var i=0; i < numdigits; i++) { 
    	var digit = parseInt(input.charAt(i)) 
    	if(i % 2 == parity) digit *= 2; 
    	if(digit > 9) digit -= 9; 
    	sum += digit; 
    }
    return (sum % 10) == 0; 
}

function checkReview() {
    if (checkout.loadWaiting!=false) return;
    checkout.setLoadWaiting('review');
}

var BluePay = Class.create();
BluePay.prototype = {
    initialize: function(saveUrl, successUrl, agreementsForm){
        this.saveUrl = saveUrl;
        this.successUrl = successUrl;
        this.agreementsForm = agreementsForm;
        this.onSave = this.nextStep.bindAsEventListener(this);
        this.onComplete = this.resetLoadWaiting.bindAsEventListener(this);
    },

    save: function(response){
        var params = Form.serialize(payment.form);
        if (this.agreementsForm) {
            params += '&'+Form.serialize(this.agreementsForm);
        }
	params.save = true;
	params += '&'+response;
        var request = new Ajax.Request(
            this.saveUrl,
            {
                method:'post',
                parameters:params,
                onComplete: this.onComplete,
                onSuccess: this.onSave,
                onFailure: checkout.ajaxFailure.bind(checkout)
            }
        );
	trans = '';
    },

    resetLoadWaiting: function(transport){
        checkout.setLoadWaiting(false, this.isSuccess);
    },

    nextStep: function(transport){
        if (transport && transport.responseText) {
            try{
                response = eval('(' + transport.responseText + ')');
            }
            catch (e) {
                response = {};
            }
            if (response.redirect) {
                this.isSuccess = true;
                location.href = response.redirect;
                return;
            }
            if (response.success) {
                this.isSuccess = true;
                window.location=this.successUrl;
            }
            else{
                var msg = response.error_messages;
                if (typeof(msg)=='object') {
                    msg = msg.join("\n");
                }
                if (msg) {
                    alert(msg);
                }
            }

            if (response.update_section) {
                $('checkout-'+response.update_section.name+'-load').update(response.update_section.html);
            }

            if (response.goto_section) {
                checkout.gotoSection(response.goto_section);
            }
        }
    },

    isSuccess: false
};
