(function() {
    'use strict';
    
    //console.log('Script loaded');
    
    var loaderShown = false;
    var loaderTimeout = null;
    
    // Function to hide loader
    function hideLoader() {
        //console.log('Hiding loader');
        loaderShown = false;
        var pageLoader = document.querySelector('.page-loader');
        if (pageLoader) {
            pageLoader.style.opacity = '0';
            pageLoader.style.visibility = 'hidden';
            setTimeout(function() {
                pageLoader.style.display = 'none';
            }, 300);
        }
        //adding comment
        // Clear timeout if exists
        if (loaderTimeout) {
            clearTimeout(loaderTimeout);
            loaderTimeout = null;
        }
        
        // Re-enable buttons
        var nextBtn = document.getElementById('next');
        var continueBtn = document.getElementById('continue');
        if (nextBtn) nextBtn.disabled = false;
        if (continueBtn) continueBtn.disabled = false;
    }
    
    // Function to check for errors
    function checkForErrors() {
        var errors = document.querySelectorAll('.error');
        var hasVisibleErrors = false;
        
        for (var i = 0; i < errors.length; i++) {
            var errorStyle = window.getComputedStyle(errors[i]);
            var errorText = errors[i].textContent.trim();
            
            // Check if error is visible and has content
            if (errorStyle.display !== 'none' && 
                errorText !== '' && 
                errors[i].offsetParent !== null) {
                hasVisibleErrors = true;
                //console.log('Found visible error:', errorText);
                break;
            }
        }
        
        return hasVisibleErrors;
    }
    
    // Function to initialize loader functionality
    function initializeLoader() {
        var pageLoader = document.querySelector('.page-loader');
        var nextBtn = document.getElementById('next');
        var continueBtn = document.getElementById('continue');
        var workingDiv = document.querySelector('.working');
        var apiContainer = document.getElementById('api');
        
        console.log('initializeLoader called', {
            pageLoader: !!pageLoader,
            nextBtn: !!nextBtn,
            continueBtn: !!continueBtn,
            workingDiv: !!workingDiv
        });
        
        // Function to show loader
		//check loader
		
        function showLoader() {
            //console.log('Showing loader');
            loaderShown = true;
            if (pageLoader) {
                pageLoader.style.display = 'flex';
                pageLoader.style.animation = 'none';
                pageLoader.style.opacity = '1';
                pageLoader.style.visibility = 'visible';
            }
            
            // Set a timeout to hide loader if no navigation happens (validation error scenario)
            loaderTimeout = setTimeout(function() {
                //console.log('Loader timeout - checking for errors');
                if (loaderShown && checkForErrors()) {
                    //console.log('Errors found after timeout - hiding loader');
                    hideLoader();
                }
            }, 500); // Check after 500ms
        }
        
        // Attach click event to Sign In button
        if (nextBtn && pageLoader) {
            //console.log('Sign In button found - attaching click event');
            nextBtn.addEventListener('click', function() {
                //console.log('Sign in button clicked');
                showLoader();
            });
        }
        
        // Attach click event to Create/Continue button
        if (continueBtn && pageLoader) {
            //console.log('Create/Continue button found - attaching click event');
            continueBtn.addEventListener('click', function() {
                //console.log('Create/Continue button clicked');
                showLoader();
            });
        }
        
        // Observer to detect validation errors appearing
        if (apiContainer) {
            var errorObserver = new MutationObserver(function(mutations) {
                if (loaderShown && checkForErrors()) {
                    //console.log('Validation errors detected via observer - hiding loader');
                    hideLoader();
                }
            });
            
            errorObserver.observe(apiContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'aria-hidden', 'class']
            });
            
            //console.log('Error observer attached');
        }
        
        // If working div exists, observe it else ok
        if (workingDiv && pageLoader) {
            var config = { attributes: true, attributeFilter: ['style'] };
            
            var callback = function(mutationsList) {
                for (var i = 0; i < mutationsList.length; i++) {
                    var mutation = mutationsList[i];
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (workingDiv.style.display === 'block') {
                            //console.log('Working div visible - showing loader');
                            showLoader();
                            if (nextBtn) nextBtn.disabled = true;
                            if (continueBtn) continueBtn.disabled = true;
                        }
                    }
                }
            };
            
            var observer = new MutationObserver(callback);
            observer.observe(workingDiv, config);
            //console.log('Observer attached to working div');
        }
        
        return !!(nextBtn || continueBtn);
    }

    // Detect when page is about to unload (navigation happening)
    window.addEventListener('beforeunload', function() {
        //console.log('Page is navigating away');
        if (loaderTimeout) {
            clearTimeout(loaderTimeout);
        }
    });

    // Keep trying to initialize every 100ms until elements are found

    var initAttempts = 0;
    var maxAttempts = 100;
    
    var initInterval = setInterval(function() {
        initAttempts++;
        //console.log('Initialization attempt #' + initAttempts);
        
        var nextBtn = document.getElementById('next');
        var continueBtn = document.getElementById('continue');
        
        if (nextBtn || continueBtn) {
            console.log('Button found! Initializing...', {
                hasNext: !!nextBtn,
                hasContinue: !!continueBtn
            });
            clearInterval(initInterval);
            initializeLoader();
        } else if (initAttempts >= maxAttempts) {
            //console.log('Max initialization attempts reached. Buttons not found.');
            clearInterval(initInterval);
        }
    }, 100);

    // Also set up a MutationObserver as backup
    var bodyObserver = new MutationObserver(function(mutations) {
        var nextBtn = document.getElementById('next');
        var continueBtn = document.getElementById('continue');
        
        if (nextBtn || continueBtn) {
           // console.log('Button detected via MutationObserver');
            clearInterval(initInterval);
            initializeLoader();
            bodyObserver.disconnect();
        }
    });

    bodyObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Password Toggle functionality using existing CSS (.pwd-wrap class)
    var processedPasswordInputs = new WeakSet();
    
    function initializePasswordToggle() {
        var passwordInputs = document.querySelectorAll("input[type='password'], input[type='text'][id='password'], input[type='text'][id='newPassword'], input[type='text'][id='reenterPassword']");
        var hasNewInputs = false;
        
        for (var i = 0; i < passwordInputs.length; i++) {
            var input = passwordInputs[i];
            
            // Skip if already processed
            if (processedPasswordInputs.has(input)) {
                continue;
            }
            
            // Mark as processed
            processedPasswordInputs.add(input);
            hasNewInputs = true;
            
            var wrapper = input.parentElement;
            
            // Skip if wrapper already has pwd-wrap class
            if (wrapper.classList.contains('pwd-wrap')) {
                continue;
            }
            
            // Add pwd-wrap class to wrapper
            wrapper.classList.add('pwd-wrap');
            
            // Add click event to wrapper's ::after pseudo-element (eye icon)
            (function(inputEl, wrapperEl) {
                wrapperEl.addEventListener('click', function(e) {
                    // Only toggle if clicked on the pseudo-element area (right side)
                    var rect = wrapperEl.getBoundingClientRect();
                    var clickX = e.clientX - rect.left;
                    
                    // Check if click is in the right 40px area (where the eye icon is)
                    if (clickX > rect.width - 40) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (inputEl.type === 'password') {
                            inputEl.type = 'text';
                            wrapperEl.classList.add('show');
                        } else {
                            inputEl.type = 'password';
                            wrapperEl.classList.remove('show');
                        }
                        inputEl.focus();
                    }
                });
            })(input, wrapper);
        }
        
        if (hasNewInputs) {
            console.debug('Password toggle functionality added to', passwordInputs.length, 'inputs');
        }
        
        return passwordInputs.length > 0;
    }

    // Initialize password toggle with proper cleanup
    var passwordInitAttempts = 0;
    var maxPasswordAttempts = 50;
    var passwordInitialized = false;
    
    var passwordInitInterval = setInterval(function() {
        passwordInitAttempts++;
        
        if (initializePasswordToggle()) {
            passwordInitialized = true;
            // Clear the interval after first successful initialization
            if (passwordInitAttempts > 10) {
                clearInterval(passwordInitInterval);
            }
        } else if (passwordInitAttempts >= maxPasswordAttempts) {
            clearInterval(passwordInitInterval);
        }
    }, 100);

    // Set up MutationObserver to watch for new password inputs in the API container
    function startPasswordObserving() {
        var apiContainer = document.getElementById('api');
        if (apiContainer) {
            var passwordObserver = new MutationObserver(function(mutations) {
                var foundNewInputs = false;
                
                for (var i = 0; i < mutations.length; i++) {
                    var mutation = mutations[i];
                    if (mutation.type === 'childList') {
                        for (var j = 0; j < mutation.addedNodes.length; j++) {
                            var node = mutation.addedNodes[j];
                            if (node.nodeType === 1) {
                                var passwordInputs = node.querySelectorAll ? 
                                    node.querySelectorAll("input[type='password']") : [];
                                if (passwordInputs.length > 0 || 
                                    (node.tagName === 'INPUT' && node.type === 'password')) {
                                    foundNewInputs = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (foundNewInputs) break;
                }
                
                if (foundNewInputs) {
                    setTimeout(function() {
                        initializePasswordToggle();
                    }, 100);
                }
            });
            
            passwordObserver.observe(apiContainer, {
                childList: true,
                subtree: true
            });
        }
    }

    // Start password observing when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startPasswordObserving);
    } else {
        startPasswordObserving();
    }

// Final script with !important - Shows both elements by default, hides with !important when #email_success[aria-hidden="false"] exists
(function() {
    'use strict';
    
    //console.log('Final verification hiding script with !important loaded');
    
    function manageElements() {
        // Check if verification is successful
        var emailSuccess = document.querySelector('#email_success[aria-hidden="false"]');
        var isVerificationSuccessful = !!emailSuccess;
        
        // Get the two elements that need to be managed
        var intro = document.querySelector('.intro');
        var emailIntro = document.getElementById('email_intro');
		const emailVerInput = document.getElementById('email_ver_input');
		var attrEntry = document.querySelector('div.attrEntry');
        
        //console.log('Verification successful (aria-hidden=false)?', isVerificationSuccessful);
		if(attrEntry){
			attrEntry.classList.add('custom-email');
		}
        
        if (isVerificationSuccessful) {
            // HIDE both elements with !important when verification is successful
            //console.log('âœ… Verification successful - HIDING both elements with !important');
            
            if (intro) {
                intro.style.setProperty('display', 'none', 'important');
                intro.style.setProperty('visibility', 'hidden', 'important');
                //console.log('  - Hidden intro element with !important');
            }
            
            if (emailIntro) {
                emailIntro.style.setProperty('display', 'none', 'important');
                emailIntro.style.setProperty('visibility', 'hidden', 'important');
                //console.log('  - Hidden email_intro element with !important');
            }
            
        } else {
            // SHOW both elements by default (when verification is not successful)
            //console.log('â„¹ï¸ Verification not successful - SHOWING both elements by default');
            
            if (intro) {
                intro.style.removeProperty('display');
                intro.style.removeProperty('visibility');
                //console.log('  - Showed intro element');
            }
            
            if (emailIntro) {
                emailIntro.style.removeProperty('display');
                emailIntro.style.removeProperty('visibility');
                //console.log('  - Showed email_intro element');
            }
			if(emailVerInput){
				const isVisible = emailVerInput.getAttribute('aria-hidden') === 'false';
				if (isVisible) {
					emailIntro.textContent = 'Please enter the OTP received from msonlineservicesteam@microsoftonline.com to verify your Email.';
				}
			}
        }
    }
    
    // Run immediately
    manageElements();
    
    // Set up observer to watch for changes to #email_success aria-hidden attribute
    function setupObserver() {
        var container = document.getElementById('api') || document.body;
        
        var observer = new MutationObserver(function(mutations) {
            var shouldCheck = false;
            
            mutations.forEach(function(mutation) {
                // Watch specifically for aria-hidden changes on email_success
                if (mutation.type === 'attributes' && 
                    mutation.target.id === 'email_success' && 
                    mutation.attributeName === 'aria-hidden') {
                    //console.log('ðŸ“ Email success aria-hidden changed');
                    shouldCheck = true;
                }
                
                // Watch for email_success element being added
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            if (node.id === 'email_success' || 
                                (node.querySelector && node.querySelector('#email_success'))) {
                                //console.log('ðŸ“ Email success element added');
                                shouldCheck = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldCheck) {
                setTimeout(manageElements, 50);
            }
        });
        
        observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['aria-hidden']
        });
        
        //console.log('âœ… Observer set up to watch for verification changes');
    }
    
    // Setup observer
    setupObserver();
    
    // Periodic check as backup
    setInterval(manageElements, 3000);
    
    // Manual test function
    window.testFinalScript = function() {
        //console.log('=== FINAL SCRIPT TEST ===');
        //console.log('email_success element:', document.querySelector('#email_success'));
        //console.log('email_success[aria-hidden="false"]:', document.querySelector('#email_success[aria-hidden="false"]'));
        //console.log('intro element:', document.querySelector('.intro'));
        //console.log('email_intro element:', document.getElementById('email_intro'));
        manageElements();
        //console.log('=== TEST COMPLETE ===');
    };
    
    //console.log('âœ… Final verification hiding script with !important ready');
    //console.log('ðŸ’¡ Run window.testFinalScript() to test');
    
})();

})();
