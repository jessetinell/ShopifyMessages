var appenPublish = appenPublish || (function () {
    var editorContainer,
        messageWrapper = $("#appen-message-wrapper");

    var init = function () {
        editorContainer = $("#template-preview");

        // Get elements with editable images
        var imageElements = $('#template-preview [data-image]');

        $.each(imageElements, function (i, el) {
            //$(el).addClass('editable-image');
            //$(el).append('<a href="javscript:void(0)" class="edit-image" id="' + $(el).data('image') + '">Byt bild</a>');
        });

        tinymce.init({
            selector: '#template-preview .editable',
            inline: true,
            plugins: [
                "advlist autolink lists link image charmap print preview anchor",
                "searchreplace visualblocks code fullscreen",
                "insertdatetime media contextmenu paste"
            ],
            toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
            setup: function (editor) {
                editor.on('change', function (e) {
                    tinyMceOnChange(e);
                });
            }
        });

        editorContainer.resizable({
            minWidth: 240,
            maxWidth: 1300,
            minHeight: 50,
            maxHeight: 900,
            stop: function (event,ui) {
                sizeChanged(event, ui);
            }
        });

        $("#message-in-screen").draggable({
            containment: '#screen',
            drag: function (e,ui) {
                var top = $(this).position().top;
                var left = $(this).position().left;
                //$("#Message_MaxWidth").val(ui.size.width);
                //$("#Message_MinHeight").val(ui.size.height);
                //console.log(e)
            }
        });

        $("#images input").change(function(e) {
            imageChanged(e);
        });

        $("#Message_UseModalBackground").change(function() {
            if ($("#Message_UseModalBackground").is(':checked')) {
                messageWrapper.addClass('modal-bg');
            } else {
                messageWrapper.removeClass('modal-bg');
            }
        });
    };

    /* == Private == */
    function imageChanged(e) {
        // RELOAD / PARSED TEMPLATE
    }
    function tinyMceOnChange(e) {
        var html = e.target.targetElm.innerHTML;
        $("#hidden-" + e.target.id).val(html);
    }
    function sizeChanged(event, ui) {
        $("#Message_MaxWidth").val(ui.size.width);
        $("#Message_MinHeight").val(ui.size.height);

        $("#message-in-screen").width(ui.size.width / 5);
        $("#message-in-screen").height(ui.size.height / 5);
    }
    //function saveTemplate() {
    //    var container = $('#template-preview');
    //    var placeholders = [];

    //    var editors = container.find('.editable');
    //    $.each(editors, function (i, el) {
    //        placeholders.push({
    //            Id: $(el).attr('id'),
    //            Content: $(el).html()
    //        });
    //    });

    //    var images = container.find('.editable-image');
    //    $.each(images, function (i, el) {
    //        placeholders.push({
    //            Id: $(el).data('image'),
    //            Content: $(el).css('background-image')
    //        });
    //    });

    //    templateJsonToTb(container.data('template'), placeholders);
    //}

    //function templateJsonToTb(templateId, placeholders) {
    //    $.ajax({
    //        type: 'POST',
    //        contentType: 'application/json; charset=utf-8',
    //        data: JSON.stringify({ 'templateId': templateId, 'placeholders': placeholders }),
    //        dataType: 'json',
    //        url: '/Json/SaveTemplate/',
    //        success: function () {
    //            //Submit the settings-form
    //            $('form').submit();
    //        },
    //        error: function () {
    //            console.log("error")
    //        }
    //    })
    //}

    return {
        Init: init
    };
})();