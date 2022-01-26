// Đối tượng Validator
function Validator(options) {

    var selectorRule = {}

    // Hàm thực hiện validate
    function Validate(inputElement, rule){
        var errorMessage ;
        var errorElement = inputElement.closest(options.formGroupSelector).querySelector(options.errorSelector);

        // Lấy ra các rule của selector
        var Rules = selectorRule[rule.selector]

        // Lặp qua từng rule & kiểm tra
        // Có lỗi thì dừng kiểm tra
        for (var i = 0; i < Rules.length; ++i){
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = Rules[i](formElement.querySelector(rule.selector + ':checked'));
                    break;
                default: 
                    errorMessage = Rules[i](inputElement.value)
            }
            if(errorMessage) break;
        }
        // Kiểm tra lỗi của ô input 
        if(errorMessage){
             errorElement.innerText = errorMessage
             inputElement.closest(options.formGroupSelector).classList.add('invalid')
        }else {
             errorElement.innerText = ''
             inputElement.closest(options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage
    }
    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form);
    if(formElement){
        // Xử lí khi submit form
        formElement.onsubmit = function(e){
            e.preventDefault()
            
            // Không có lỗi để lấy giả trị trong input
            var isFormValid = true;

            // Thực hiện lặp qua từng rule và validate
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = Validate(inputElement, rule);
                if(!isValid){
                    isFormValid = false
                }
            })
            if(isFormValid){
                // Trường hợp submit với javascript
                if(typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    var formValue = Array.from(enableInputs).reduce(function(values, input){
                        switch(input.type){
                            case 'radio':

                                // Nếu bắt buộc phải check
                                // values[input.name] = formElement.querySelector('input[name="'+ input.name+'"]:checked').value

                                // Nếu ko bắt buộc, xử lí đc cả TH bắt buộc
                                if (input.matches(':checked')) {
                                    values[input.name] = []
                                    values[input.name].push(input.value);
                                    } else if (!values[input.name]) {
                                    values[input.name] = '';
                                    }
                                break;
                            case 'checkbox':
                                // Nếu ko bắt buộc, xử lí đc cả TH bắt buộc
                                if (input.matches(':checked')) {
                                    if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                    }
                                    values[input.name].push(input.value);
                                    } else if (!values[input.name]) {
                                    values[input.name] = '';
                                    }
                                break;
                            case 'file':
                                values[input.name] = input.files
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values; 
                    },{})
                    options.onSubmit(formValue)
                }
                // Trường hợp submit với hành vi mặc định
                else{
                    formElement.submit()
                }
            }
        }
    

        // Lặp qua mỗi rule và xử lí ( lắng nghe sự kiện blur, input,...)
        options.rules.forEach(function(rule){

            // Lưu lại các rules cho mỗi input
            if(Array.isArray(selectorRule[rule.selector])){
                selectorRule[rule.selector].push(rule.test)
            }else{
                selectorRule[rule.selector] = [rule.test]
            }

            var inputElement = formElement.querySelectorAll(rule.selector);

            Array.from(inputElement).forEach(function(inputElement){
                // Trường hợp blur khỏi input
                inputElement.onblur = function(){
                    Validate(inputElement, rule);
                }
                // Xử lí mỗi khi người dùng nhập vào input
                inputElement.oninput = function(){
                    var errorElement = inputElement.closest(options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = ''
                    inputElement.closest(options.formGroupSelector).classList.remove('invalid')
                }
            })
        })
    }
}

// Định nghĩa rules
// Nguyên tắc các rules : 
// 1. Khi có lỗi => Trả ra message lỗi
// 2. Khi hợp lệ => Ko trả ra gì cả
Validator.isRequired = function (selector){
    return {
        selector : selector,
        test: function (value){
            return value ? undefined : 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function (selector){
    return {
        selector : selector,
        test: function (value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email'
        }
    }
}

Validator.minLength = function (selector, min){
    return {
        selector : selector,
        test: function (value){
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmvalue, pass){
    return {
        selector : selector,
        test: function (value){
            return value === getConfirmvalue() ? undefined : pass || 'Giá trị nhập vào không chính xác'
        }
    }
}