
// mtr_conversion_site_settings is an object containing the settings for the current site
// It contains:
// pageviews: Number of pageviews before banner shows. Can not be used with duration
// pageviewsResetCounter: Resets the pageviews counter this many times. Ex. if pageviews is 3 and pageviewsResetCounter is 5: Banner will show on view 3,6,9,12,15,18 (6 times) and then not again 
// duration: Number of seconds before banner shows. Can not be used with pageviews
// insertAfter: Id of tag that banner should be placed after
// innerHtml: Html of banner
// persist: Persists banner until user closes it
// excludePaths: If set the pageviews property will not count when any of the pages in this array is viewed. Can not be used with includePaths
// includePaths: If set the pageviews property will only count when any of the pages in this array is viewed. Can not be used with excludePaths
// activateOnPaths: If set the pageviews property will not begin to count until one of the pages in this array is viewed
// OnOpen: function runs when banner is opened
// domains: ???
// targetGroup: ???
//var mtr_conversion_site_settings = [{ pageviews: 5, duration: 20, insertAfter: "mySelector", innerHTML: "<b>Min banner</b><br/><div><a href='#'>Länk till något</a></div><div><a href='#'>En till länk</a></div>", activateOnPaths: [ "/products" ] } ];
//var mtr_site_id = 12345;


var mtr_conversion = mtr_conversion || (function () {


    var bannerOpen = false;


    // Regex for form-tagging
    var regexEmail = /(.*e-?mail.*)|(.*e-?post.*)$/i;
    var regexFirstName = /(.*first[-|_]?name)|(f-?name)|(.*förnamn)$/i;
    var regexLastName = /(.*last[-|_]?name)|(sur-?name)|(.*efternamn)|(enam[e|n])$/i;
    var regexName = /^(^\*?\s?nam[e|n]:?\s?\*?$)|(^user-?name$)|(^(your|ditt)[_|-]?(name|namn)$)$/i;
    var regexOrganization = /(.*organization*)|(org-?name)|(firm)|(company[-?name]?)|(.*företag.*)$/i;
    var regexTelephone = /(.*tel.*)|(.*tel.*n[umber]?r)|(.*mobil.*)|(.*phone.*)$/i;


    // Regex for form-validation
    var regexValidEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var regexBusinessEmail = /(.*yahoo.*)|(.*gmail.*)|(.*hotmail.*)$/i;



    var init = function () {
        // Check if we have the correct site_settings-object
        if (typeof mtr_conversion_site_settings === "undefined") {
            console.log("Warning! mtr_conversion needs the object mtr_conversion_site_settings");
            return;
        }
        if (mtr_conversion_site_settings.length == 0) {
            console.log("Warning! mtr_conversion needs the object mtr_conversion_site_settings to have children");
            return;
        }


        // Get visitor from server if any banner is targetGroup
        var doInitBanners = true;
        var visitor = null;
        for (var bannerIndex = 0; bannerIndex < mtr_conversion_site_settings.length; bannerIndex++) {
            // Get current banner
            var banner = mtr_conversion_site_settings[bannerIndex];
            if (!banner.domains || contains(banner.domains, window.location.host.replace(/^www\./i, ""))) {
                if (banner.targetGroup) {
                    visitor = getVisitor();
                    doInitBanners = false;
                    continue; // End execution here, we will pick it up in getVisitorCallback
                }
            }
        }


        // Initiate banners, if we found a visitor earlier this will be run from getVisitorCallback
        if (doInitBanners)
            initBanners();
    }


    var initBanners = function (visitor) {
        // Loop thu all banners and check their configuration
        for (var bannerIndex = 0; bannerIndex < mtr_conversion_site_settings.length; bannerIndex++) {
            // Get current banner
            var banner = mtr_conversion_site_settings[bannerIndex];


            if (!banner.domains || contains(banner.domains, window.location.host.replace(/^www\./i, ""))) {


                // Reset duration counter on each pageload
                if (banner.duration)
                    mtr_conversion.SetCookie("mtr_conversion_duration_" + bannerIndex, 0);


                // Dev options
                if (window.location.href.indexOf('?dev') > -1) {
                    // Check if we should reset cookies
                    if (getQueryStringValue("reset") == banner.bannerId.toString()) {
                        saveUserState({ is_banner_active: getBannerActiveSetting(bannerIndex, banner) }, bannerIndex, mtr_site_id);


                        var closedBanners = getClosedBanners(mtr_site_id);
                        if (contains(closedBanners, bannerIndex)) {
                            closedBanners.pop(bannerIndex);
                            mtr_conversion.SetCookie("mtr_conversion_closed_banners_" + mtr_site_id, JSON.stringify(closedBanners));
                        }
                    }


                    // Check if we should force banner to be opened
                    if (getQueryStringValue("open") == banner.bannerId.toString()) {
                        openBanner(banner, bannerIndex);
                        continue;
                    }
                }


                // Check if should init banner or do target group request
                var shouldInitBanner = true;
                if (visitor)
                    shouldInitBanner = initBannerTargetGroup(bannerIndex, banner, visitor);
                if (shouldInitBanner)
                    initBanner(bannerIndex, banner);
            }
        }
    }


    var initBanner = function (banner_id, banner) {
        // Get the users current state for this banner
        var state = getUserState(mtr_site_id, banner_id, banner);


        // Activate banner if activateOnPath is current page and banner is not activated
        if (getBannerActiveSetting(banner_id, banner) && !state.is_banner_active) {
            state.is_banner_active = true;
        }


        // start duration timer if banner is active
        if (state.is_banner_active && banner.duration != null) {
            onActivate(banner_id, banner);
        }


        // Update the users state with the information from this pageview
        if (checkIfStateShouldBeUpdated(state, banner)) {
            state = updateuserState(state, banner_id, banner);
        }


        // Check if the banner should be opened and open it
        if (checkIfBannerShouldBeOpened(state, banner_id, banner)) {
            if (banner.activateOnScrollPosition) {
                openBannerOnScrollPosition(banner, banner_id, function () {
                    state.is_opened = true;
                    saveUserState(state, banner_id, mtr_site_id);
                });
            } else {
                openBanner(banner, banner_id);
                state.is_opened = true;
            }
            state = resetUsersPageviews(banner, state);
        }


        // Save user state for next view
        saveUserState(state, banner_id, mtr_site_id);
    }


    var initBannerTargetGroup = function (bannerIndex, banner, visitor) {


        if (!banner.targetGroup)
            return true;


        var shouldInitBanner = false;


        visitor = updateVisitorFromCookies(banner, visitor);


        // Check Profilings if banner should be opened, first we need to convert the object to a flat array
        var validProfilings = banner.targetGroup.Profilings;
        if (validProfilings) {
            var userProfilingNames = [];
            for (var profiling in visitor.profilings) {
                userProfilingNames.push(profiling);
            }


            shouldInitBanner = initBannerTargetGroupCheck(validProfilings, userProfilingNames);
        }


        // Check Labels if banner should be opened, since user haven´t any valid profilings
        if (!shouldInitBanner) {
            shouldInitBanner = initBannerTargetGroupCheck(banner.targetGroup.Labels, visitor.labels);
        }


        // Check Goals if banner should be opened
        if (!shouldInitBanner) {
            shouldInitBanner = initBannerTargetGroupCheck(banner.targetGroup.Goals, visitor.goals);
        }


        // Check Campaigns if banner should be opened
        if (!shouldInitBanner) {
            shouldInitBanner = initBannerTargetGroupCheck(banner.targetGroup.Campaigns, visitor.campaigns);
        }


        // Check GoalsExclude if banner should be opened 
        shouldInitBanner = initBannerTargetGroupCheckExclude(banner.targetGroup.GoalsExclude, visitor.goals, shouldInitBanner);


        // Check CampaignsExclude if banner should be opened
        shouldInitBanner = initBannerTargetGroupCheckExclude(banner.targetGroup.CampaignsExclude, visitor.campaigns, shouldInitBanner);


        return shouldInitBanner;
    }


    var updateVisitorFromCookies = function (banner, visitor) {
        // Get goals from cookies
        var checkGoals = banner.targetGroup.Goals;
        if (!checkGoals) checkGoals = [];
        checkGoals = checkGoals.concat(banner.targetGroup.GoalsExclude);
        for (var j = 0; j < checkGoals.length; j++) {
            var name = checkGoals[j];
            var goal = mtr_conversion.GetCookie("mtr_goal-" + name);
            if (goal) {
                if (!visitor.goals)
                    visitor.goals = [];
                visitor.goals.push(name);
            }
        }
        // Get campaigns from url and cookie
        var campaign = mtr_conversion.GetQueryStringValue("utm_campaign");
        if (campaign) {
            mtr_conversion.SetCookie("mtr_campaign", campaign, 420);
        } else {
            campaign = mtr_conversion.GetCookie("mtr_campaign");
        }
        if (campaign) {
            if (!visitor.campaigns)
                visitor.campaigns = [];
            visitor.campaigns.push(campaign);
        }


        return visitor;
    }


    var initBannerTargetGroupCheck = function (bannerObject, userObject) {
        if (bannerObject && userObject) {
            for (var j = 0; j < bannerObject.length; j++) {
                if (contains(userObject, bannerObject[j])) {
                    return true;
                }
            }
        }
        return false;
    }


    var initBannerTargetGroupCheckExclude = function (bannerObject, userObject, shouldInitBanner) {
        if (bannerObject && userObject) {
            for (var j = 0; j < bannerObject.length; j++) {
                if (contains(userObject, bannerObject[j])) {
                    return false;
                }
            }
        }
        return shouldInitBanner;
    }


    // Get the users current state for this banner from cookie
    var getUserState = function (site_id, banner_id, banner) {
        var state = mtr_conversion.GetCookie("mtr_conversion_state_" + site_id + "_" + banner_id);
        if (state)
            state = JSON.parse(state);
        else
            state = { is_banner_active: getBannerActiveSetting(banner_id, banner) };
        return state;
    }


    // Get bool showing if current banner is being activated on this pageview
    var getBannerActiveSetting = function (banner_id, banner) {
        if (banner.activateOnPaths) {
            return matchesPath(banner.activateOnPaths);
        }
        return true;
    }


    // Get a list of the banners this user has seen and closed from cookie
    var getClosedBanners = function (site_id) {
        var closed_banners = mtr_conversion.GetCookie("mtr_conversion_closed_banners_" + site_id);
        if (closed_banners)
            closed_banners = JSON.parse(closed_banners);
        else
            closed_banners = [];
        return closed_banners;
    }


    // Mark this banner as closed, it should not be opened again (for a day)
    var markBannerAsClosed = function (site_id, banner_id) {
        var closed_banners = getClosedBanners(site_id);


        var is_closed = contains(closed_banners, banner_id);
        if (!is_closed)
            closed_banners.push(banner_id);


        var oneDay = 86400;
        mtr_conversion.SetCookie("mtr_conversion_closed_banners_" + site_id, JSON.stringify(closed_banners), oneDay);
    }


    // Check if state should be updated for this banner
    var checkIfStateShouldBeUpdated = function (state, banner) {


        if (banner.includePaths && banner.excludePaths) {
            console.log("Warning! includePaths and excludePaths cannot be used at the same time");
        }


        if (banner.includePaths) {
            return matchesPath(banner.includePaths);
        }


        if (banner.excludePaths) {
            for (var i = 0; i < banner.excludePaths.length; i++) {
                var excludePath = banner.excludePaths[i];


                // Wildcard
                if (isWildcard(excludePath)) {


                    // Remove star
                    excludePath = removeWildcard(excludePath);


                    // Starts-with match
                    if (document.location.pathname.substr(0, excludePath.length) == excludePath)
                        return false;


                } else {


                    // Exact match
                    if (excludePath == document.location.pathname) {
                        return false;
                    }
                }
            }
        }
        return true;
    }


    var matchesPath = function (paths) {
        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];


            // Wildcard
            if (isWildcard(path)) {


                // Remove star
                path = removeWildcard(path);


                // Starts-with match
                if (document.location.pathname.substr(0, path.length) == path)
                    return true;
            } else {
                // Exact match
                if (path == document.location.pathname) {
                    return true;
                }
            }
        }
        return false;
    };


    // Check if string is a wildcard (ends with a star)
    var isWildcard = function (s) {
        return s.substr(s.length - s.length - 1) == "*";
    }


    // Remove star
    var removeWildcard = function (s) {
        return s.substr(0, s.length - 1);
    }


    // Update the information on the current users state
    var updateuserState = function (state, banner_id, banner) {


        // Update is_banner_active on inactive banners
        if (!state.is_banner_active)
            state.is_banner_active = getBannerActiveSetting(banner_id, banner);


        if (state.is_banner_active) {


            // Add 1 to current pageview
            state.pageviews = state.pageviews ? state.pageviews = state.pageviews + 1 : 1;


        }


        return state;
    }


    // Save user state for next view
    var saveUserState = function (state, banner_id, site_id) {
        mtr_conversion.SetCookie("mtr_conversion_state_" + site_id + "_" + banner_id, JSON.stringify(state), 3600); // 3600 = one hour
    }


    // Reset users pageviews (if we should)
    var resetUsersPageviews = function (banner, state) {
        var reset_counter = state.pageviews_resetcounter;
        if (!reset_counter)
            reset_counter = 0;
        if (reset_counter < banner.pageviewsResetCounter) {
            state.pageviews = 0;
            state.pageviews_resetcounter = reset_counter + 1;
        }
        return state;
    }


    // Check if we sould open the banner on this pageview
    var checkIfBannerShouldBeOpened = function (state, banner_id, banner) {


        // Don't open banners that the user has closed sometime
        var closed_banners = getClosedBanners(mtr_site_id);
        var is_closed = contains(closed_banners, banner_id);
        if (is_closed)
            return false;


        // Don't open banner if it is persist and path is excluded
        if (!checkIfStateShouldBeUpdated(state, banner))
            return false;


        // Open on pageviews
        if (banner.pageviews && state.pageviews == banner.pageviews)
            return true;


        // Persist
        if (banner.persist && state.pageviews > banner.pageviews)
            return true;


        // Open on url-hash
        var hash = window.location.hash;
        if (hash.length > 0 && hash.substr(1, 11) == "conversion-") {
            var hash_banner_id = hash.substr(12);
            if (hash_banner_id == banner_id)
                return true;
        }


        return false;
    }


    // Show the conversion banner
    var openBanner = function (banner, banner_id) { // banner_id = banner index
        if (banner_id == null) {
            console.log("Error: Open needs to know what banner to open");
            return;
        }
        // hide for template and IE8 or less
        // TODO: make templates work in IE8
        if (!document.addEventListener && banner.isTemplate) {
            console.log("ConversionBanner: Browser not supported");
            return;
        }


        if (bannerOpen === false) {
            var insertAfter = document.getElementById(banner.insertAfter);
            // layout is Banner by default in non wizard setup
            if (!insertAfter && banner.layout == "Banner") {
                console.log("Warning! The choosen insertAfter for mtr_conversion was not found");
                return;
            }


            var element = document.createElement('div');
            element.id = "mtr-conversion";
            if (banner.cssClass)
                element.className += banner.cssClass + " ";


            if (banner.innerHTML)
                element.innerHTML = banner.innerHTML;


            // Add element after the selector from settings
            if (insertAfter) {
                insertElementAfter(element, insertAfter);
            } else {
                document.body.appendChild(element);
            }


            // adds background to popup banner
            if (banner.layout == 'Popup' || banner.layout == 2) {
                addModalBackground();
                adjustVerticalPosition(banner);
            }


            // Set url-hash
            window.location.hash = "conversion-" + banner_id;


            // Make sure the initial state is applied, the css-element transition is required for animation
            var x = element.clientHeight; // TODO: Not used - can we remove this?


            // Fade it in
            element.className += "mtr-conversion-show";


            // Log click, only first time a banner is opened
            if (!getUserState(mtr_site_id, banner_id, banner).is_opened) {
                mtr.log(banner.logUrl);
            }


            if (banner.requiredFormFields || banner.thankYouText || banner.formSubmitGoal || banner.corporateEmailFormFields || banner.formSubmitRedirect) {
                var forms = document.getElementById("mtr-conversion").getElementsByTagName("form");
                for (var i = 0; i < forms.length; i++) {
                    if (forms[i].attachEvent) {
                        forms[i].attachEvent('onsubmit', function (e) {
                            formSubmit(banner, (e.target) ? e.target : e.srcElement, true, banner_id);
                        });
                        forms[i].attachEvent('onchange', function (e) {
                            formSubmit(banner, (e.currentTarget) ? e.currentTarget : e.srcElement.parentNode);
                        }, false);
                    } else if (forms[i].addEventListener) {
                        forms[i].addEventListener('submit', function (e) {
                            formSubmit(banner, (e.target) ? e.target : e.srcElement, true, banner_id);
                        }, false);
                        forms[i].addEventListener('change', function (e) {
                            formSubmit(banner, (e.currentTarget) ? e.currentTarget : e.srcElement.parentNode);
                        }, false);
                    }
                }
            }


            bannerOpen = banner_id;
            if (banner.bannerId)
                addEvent("onBannerOpened", banner.bannerId);
        }
    }


    var formSubmit = function (banner, form, isSubmit, bannerId) {
        var isValid = true;
        var inputs = form.getElementsByTagName("input");


        // Validate form
        if (banner.requiredFormFields || banner.corporateEmailFormFields) {
            isValid = validateForm(banner, form, inputs);
        }


        if (isValid && isSubmit) {
            // Set tagged information on mtr_custom.session from current form
            setSessionCustom(inputs);


            if (banner.thankYouText) {
                if (document.getElementById('bpv-form-ty') == null) {
                    // For bannern not created in wizard
                    var formParent = form.parentNode;
                    var div = document.createElement("div");
                    div.id = "";
                    div.innerHTML = banner.thankYouText;
                    formParent.insertBefore(div, form);
                    formParent.removeChild(form);
                } else {
                    // For bannern created in wizard
                    toggleThankYou();
                }
            }
            if (banner.closeAfterValidation) {
                // redirect
                if (banner.formSubmitRedirect) {
                    window.location.href = banner.formSubmitRedirect;
                }
                closeBanner();
            } else {
                markBannerAsClosed(mtr_site_id, bannerId);
            }
            mtr.goal(banner.formSubmitGoal);
        }
    }


    var validateForm = function (banner, inputs) {
        var isValid = true;
        for (var j = 0; j < inputs.length; j++) {
            var currentInput = inputs[j];
            if (currentInput.getAttribute("type") == "text") {
                if (banner.requiredFormFields) {
                    for (var k = 0; k < banner.requiredFormFields.length; k++) {
                        var nameAttr = currentInput.getAttribute("name");
                        if (nameAttr == banner.requiredFormFields[k]) {
                            // Remove current error-class
                            currentInput.className = currentInput.className.replace(/\s\berror\b/, '');


                            if (!currentInput.value || (nameAttr.match(regexEmail) && !currentInput.value.match(regexValidEmail))) {
                                currentInput.className = currentInput.className + " error";
                                isValid = false;
                            }
                        }
                    }
                }
                if (banner.corporateEmailFormFields) {
                    for (var i = 0; i < banner.corporateEmailFormFields.length; i++) {
                        var nameAttrBusiness = currentInput.getAttribute("name");
                        if (nameAttrBusiness == banner.corporateEmailFormFields[i]) {
                            currentInput.className = currentInput.className.replace(/\s\berror\b/, '');
                            if (!currentInput.value || currentInput.value.match(regexBusinessEmail) || !currentInput.value.match(regexValidEmail)) {
                                currentInput.className = currentInput.className + " error";
                                isValid = false;
                            }
                        }
                    }
                }
            }
        }
        return isValid;
    }


    var setSessionCustom = function (inputs) {
        if (inputs.length > 0) {
            if (!mtr_custom.session)
                mtr_custom.session = {};


            var firstName = "";
            var lastName = "";
            var unknownFieldNumber = 1;
            for (var i = 0; i < inputs.length; i++) {
                var fieldName = "unknown";
                var currentInput = inputs[i];


                var currentInputValue = currentInput.value;
                if (currentInputValue) {
                    var currentInputName = currentInput.name;
                    if (currentInputName) {
                        // Check known fields first with regex
                        if (currentInputName.match(regexName)) {
                            fieldName = "name";
                        } else if (currentInputName.match(regexEmail)) {
                            fieldName = "email";
                        } else if (currentInputName.match(regexOrganization)) {
                            fieldName = "organization";
                        } else if (currentInputName.match(regexTelephone)) {
                            fieldName = "phone";
                        } else if (currentInputName.match(regexFirstName)) {
                            firstName = currentInputValue;
                            continue; // Don´t add this as a field, merge to "name" later
                        } else if (currentInputName.match(regexLastName)) {
                            lastName = currentInputValue;
                            continue; // Don´t add this as a field, merge to "name" later
                        } else {
                            // Create dynamic field from name attribute if no regex matches
                            fieldName = cleanupIrregularCharacters(currentInput.getAttribute('name'));
                        }


                        // Change value to bool for checkboxes
                        if (currentInput.type == "checkbox")
                            currentInputValue = currentInput.checked;
                    } else {
                        // Set field-name for unknown field
                        if (unknownFieldNumber > 1) {
                            fieldName += unknownFieldNumber;
                        }
                        unknownFieldNumber++;
                    }


                    // Set custom field with value from input
                    mtr_custom.session[fieldName] = currentInputValue;
                }
            }


            // Merge name
            if (firstName || lastName) {
                if (firstName) {
                    // Add space between first and last name
                    lastName = " " + lastName;
                }
                mtr_custom.session["name"] = firstName + lastName;
            }
        }
    }


    var validateInputs = function (bannerIndex, elementId, successCallback, setCustomOnSuccess) { // TODO: Change bannerIndex to ID
        var banner = mtr_conversion_site_settings[bannerIndex];
        var inputs = document.getElementById(elementId).getElementsByTagName("input");
        if (validateForm(banner, inputs)) {
            if (setCustomOnSuccess) {
                setSessionCustom(inputs);
            }
            if (successCallback) {
                successCallback();
            }
        }
    }


    var cleanupIrregularCharacters = function (str) {
        str = str.replace('å', 'a').replace('ä', 'a').replace('ö', 'o');
        return str.replace(/[^a-zA-Z0-9]/g, '');
    }


    // Remove the banner
    var closeBanner = function () {
        removeModalBackground();
        toggleThankYou(true);
        var banner_id = bannerOpen;
        var element = document.getElementById("mtr-conversion");
        element.parentNode.removeChild(element);
        // Remove hash, handle exception for older browsers
        try {
            history.pushState('', document.title, window.location.pathname + window.location.search);
        } catch (ex) {
            window.location.hash = "";
        }
        markBannerAsClosed(mtr_site_id, banner_id);
        bannerOpen = false;


        var bannerId = mtr_conversion_site_settings[banner_id].bannerId;
        if (bannerId)
            addEvent("onBannerClosed", bannerId);
    }


    // Show a modal popup with an iframe
    var openPopup = function (url) {


        var overlay = document.createElement('div');
        overlay.id = "mtr-conversion-overlay";
        document.body.appendChild(overlay);


        var popup = document.createElement('div');
        popup.id = "mtr-conversion-overlay-popup";
        var close = "<a class='mtr-close' onclick='mtr_conversion.ClosePopup()'></a>";
        var iframe = "<iframe src='" + url + "' marginheight='0' marginwidth='0' frameborder" +
        "='0'></iframe>";
        popup.innerHTML = close + iframe;
        document.body.appendChild(popup);
    }


    // Close and remove the popup
    var closePopup = function () {
        var overlay = document.getElementById("mtr-conversion-overlay");
        document.body.removeChild(overlay);
        var popup = document.getElementById("mtr-conversion-overlay-popup");
        document.body.removeChild(popup);
    }


    // Insert an element after another element
    var insertElementAfter = function (element, insertAfter) {
        if (insertAfter.nextSibling) {
            insertAfter.parentNode.insertBefore(element, insertAfter.nextSibling);
        }
        else {
            insertAfter.parentNode.appendChild(element);
        }
    }


    // Set interval timer dor duration until banner opens
    var setDurationTimer = function (banner_id, banner) {


        if (banner.pageviews && banner.duration) {
            console.log("Warning! pageviews and duration cannot be used at the same time");
        }


        if (banner.duration) {


            // Don't open banners that the user has closed sometime
            var closed_banners = getClosedBanners(mtr_site_id);
            var is_closed = contains(closed_banners, banner_id);
            if (!is_closed) {


                var duration = parseInt(banner.duration);


                // Get previus duration from cookie
                var prev_duration = mtr_conversion.GetCookie("mtr_conversion_duration_" + banner_id);
                if (prev_duration) {
                    duration = duration - parseInt(prev_duration);
                }


                // Store date before interval
                var expireDate = new Date;
                expireDate.setTime(expireDate.getTime() + (3600 * 1000));


                // Update cookie for next pageview
                setInterval(function () {
                    var c = mtr_conversion.GetCookie("mtr_conversion_duration_" + banner_id);
                    if (!c)
                        c = 0;
                    mtr_conversion.SetCookie("mtr_conversion_duration_" + banner_id, parseInt(c) + 1, null, expireDate.toGMTString());
                }, 1000);


                // Set timer for when banner should open, only if the duration time has not already passed
                if (duration > -1)
                    setTimeout(function () { onDurationTimeout(banner_id, banner); }, duration * 1000);
            }


        }
    }


    var contains = function (array, value) {
        for (i = 0; i < array.length; i++) {
            if (array[i] === value) {
                return true;
            }
        }
        return false;
    }


    var getQueryStringValue = function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }


    var addEvent = function (name, bannerId) {
        //if (window.addEventListener)
        // window.addEventListener(name, null); // TODO: Can we remove this?


        if (document.createEvent) {
            var customEvent = document.createEvent("Events");
            customEvent.initEvent(name, true, true);
            customEvent.banner_id = bannerId;
            document.dispatchEvent(customEvent);
        }
    }


    var addModalBackground = function () {
        // layout:popup settings. add modal background. is removed at closeBanner().
        var modalbg = document.createElement('div');
        modalbg.id = "modalbg";
        modalbg.setAttribute("style", "width:100%;height:" + getDocHeight() + "px;background-color:rgba(68,68,68,.7);position:absolute;top:0;left:0;z-index:990;");
        var body = document.getElementsByTagName('body')[0];
        body.appendChild(modalbg);
    }


    var getDocHeight = function () {
        var D = document;
        return Math.max(
        D.body.scrollHeight, D.documentElement.scrollHeight,
        D.body.offsetHeight, D.documentElement.offsetHeight,
        D.body.clientHeight, D.documentElement.clientHeight
        );
    }


    var adjustVerticalPosition = function (banner) {
        if (banner.layout == 'Popup' || banner.layout == 2) {
            var cb = document.getElementById("mtr-conversion");
            var bannerHeight = cb.offsetHeight;
            var viewPortHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            var distance = Math.floor((viewPortHeight / 2) - (bannerHeight / 2));
            cb.style.top = distance + "px";
        }
    }


    var removeModalBackground = function () {
        var modalbg = document.getElementById('modalbg');
        if (modalbg) {
            var body = document.getElementsByTagName('body')[0];
            body.removeChild(modalbg);
        }
    }


    // Toggle thank-you-text after submitting form or when closing banner
    var toggleThankYou = function (hide) {
        var displayNone = "display:none;";
        var displayBlock = "display:block";
        var form = document.getElementById('bpv-form-orig');
        if (form) {
            form.setAttribute('style', hide ? displayBlock : displayNone);
            document.getElementById('bpv-form-ty').setAttribute('style', hide ? displayNone : displayBlock);
        }
    }


    var openBannerOnScrollPosition = function (banner, banner_id, callback) {
        if (banner.activateOnScrollPosition && bannerOpen === false) {
            var value = banner.activateOnScrollPosition;
            var bannerAlreadyOpened = false;
            // check if activateOnScrollPosition is a number. if so - use percentage
            if (!isNaN(parseFloat(value)) && isFinite(value)) {
                var percentage = "0." + value;
                if (value == 100) {
                    percentage = 1;
                }
                else if (value > 100) {
                    console.log("Warning! Activate on scroll value cannot be over 100%");
                    return;
                }
                var pageHeight = document.body.clientHeight - window.innerHeight;
                var scrollValue = Math.floor(pageHeight * percentage);


                if (window.addEventListener) {
                    window.addEventListener('scroll', function () {
                        onScroll(callback);
                    }, false);
                } else if (window.attachEvent) {
                    window.attachEvent('onscroll', function () {
                        onScroll(callback);
                    });
                }


                function onScroll(callbackScrolling) {
                    var scrollTop = typeof window.scrollY == 'undefined' ? document.documentElement.scrollTop : window.scrollY;
                    if (scrollTop >= scrollValue && !bannerAlreadyOpened) {
                        openBanner(banner, banner_id);
                        bannerAlreadyOpened = true;
                        callbackScrolling();
                    }
                }
            }


                // activateOnScrollPosition is an Id
            else {
                var positionElement = document.getElementById(banner.activateOnScrollPosition);
                window.addEventListener('scroll', function (e) {
                    var scrollTop = typeof window.scrollY == 'undefined' ? document.documentElement.scrollTop : window.scrollY;
                    var browserHeight = window.innerHeight;
                    var span = scrollTop - (positionElement.offsetTop - browserHeight + 50);
                    if (span > 0 && !bannerAlreadyOpened) {
                        openBanner(banner, banner_id);
                        bannerAlreadyOpened = true;
                    }
                });
            }
        }
    }


    // EVENTS


    var onActivate = function (banner_id, banner) {
        setDurationTimer(banner_id, banner);
    }


    var onDurationTimeout = function (banner_id, banner) {


        var closed_banners = getClosedBanners(mtr_site_id);
        var is_closed = contains(closed_banners, banner_id);
        if (is_closed) {
            return;
        }


        // TODO: Måste vi matcha path här? Räcker det inte med att kolla om banner är aktiverad?
        if (banner.activateOnPaths && !matchesPath(banner.activateOnPaths)) {
            return;
        }


        openBanner(banner, banner_id);


        // Get the users current state for this banner
        var state = getUserState(mtr_site_id, banner_id, banner);
        state.is_opened = true;


        // Save user state for next view
        saveUserState(state, banner_id, mtr_site_id);
    }


    var getVisitor = function () {
        var visitor = mtr_conversion.GetCookie("mtr_visitor");
        if (visitor) {
            initBanners(JSON.parse(visitor));
        } else {
            var uid = mtr_conversion.GetCookie("_mtruid");
            if (uid) {
                var script = document.createElement('script');
                //script.src = "http://localhost:52413/Contact?site_id=" + mtr_site_id + "&uid=" + uid + "&callback=mtr_conversion.GetVisitorCallback";
                script.src = "http://api.triggerbee.com/Contact?site_id=" + mtr_site_id + "&uid=" + uid + "&callback=mtr_conversion.GetVisitorCallback";
                document.body.appendChild(script);
                // initBanners will be run from getVisitorCallback
            } else {
                // We have no uid so we can not get a visitor
                initBanners(null);
            }
        }
    }


    var getVisitorCallback = function (visitor) {
        mtr_conversion.SetCookie("mtr_visitor", JSON.stringify(visitor), 300); // five minutes
        initBanners(visitor);
    }


    var getCookie = function (name) {
        var ca = document.cookie.split(';');
        for (var i = 0, l = ca.length; i < l; i++) {
            if (ca[i].match(new RegExp("\\b" + name + "="))) {
                return decodeURIComponent(ca[i].split(name + '=')[1]);
            }
        }
        return '';
    }


    var setCookie = function (name, value, expires, gmtString) {
        var ex = new Date;
        ex.setTime(ex.getTime() + (expires || 10 * 365 * 86400) * 1000);
        document.cookie = name + "=" + value + ";expires=" + (gmtString || ex.toGMTString()) + ";path=/;domain=" + "." + location.hostname.replace(/^www\./i, "") + ";";
    }


    // Public
    return {
        Init: init,
        Open: openBanner,
        Close: closeBanner,
        OpenPopup: openPopup,
        ClosePopup: closePopup,
        MarkBannerAsClosed: markBannerAsClosed,
        ValidateInputs: validateInputs,
        GetVisitorCallback: getVisitorCallback,
        GetCookie: getCookie,
        SetCookie: setCookie,
        GetQueryStringValue: getQueryStringValue
    };


})();



// Initiate the conversion-banner onload
if (window.attachEvent)
    window.attachEvent('onload', function () { mtr_conversion.Init(); });
else if (window.addEventListener)
    window.addEventListener('load', function () { mtr_conversion.Init(); }, false);