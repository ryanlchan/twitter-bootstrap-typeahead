﻿$(function () {

    module("bootstrap-typeahead", {
        setup: function () {
            $.mockjax({
                url: '/test',
                responseText: [{ id: 1, name: 'aaa' }, { id: 2, name: 'aab' }, { id: 3, name: 'aac'}, { id: 4, name: 'abc'}, { id: 5, name: 'bbc'}]
            });
        },
        teardown: function () {
            $.mockjaxClear();
        }
    });

    test("should be defined on jquery object", function () {
        ok($(document.body).typeahead, 'alert method is defined');
    });

    test("should return element", function () {
        ok($(document.body).typeahead()[0] == document.body, 'document.body returned');
    });

    test("should listen to an input", function () {
        var $input = $('<input />');
        $input.typeahead();

        ok($input.data('events').blur, 'has a blur event');
        ok($input.data('events').keypress, 'has a keypress event');
        ok($input.data('events').keyup, 'has a keyup event');

        if ($.browser.webkit || $.browser.msie) {
            ok($input.data('events').keydown, 'has a keydown event');
        } else {
            ok($input.data('events').keydown, 'does not have a keydown event');
        }
    });

    test("should create a menu", function () {
        var $input = $('<input />');
        ok($input.typeahead().data('typeahead').$menu, 'has a menu');
    });

    test("should listen to the menu", function () {
        var $input = $('<input />'),
            $menu = $input.typeahead().data('typeahead').$menu;

        ok($menu.data('events').mouseover, 'has a mouseover(pseudo: mouseenter)');
        ok($menu.data('events').click, 'has a click');
    });

    test("should show menu when query entered", function () {
        var $input = $('<input />').typeahead({
                source: [{ id: 1, name: 'aa' }, { id: 2, name: 'ab' }, { id: 3, name: 'ac'}]
            }),
            typeahead = $input.data('typeahead');

        $input.val('a');
        typeahead.lookup();

        ok(typeahead.$menu.is(":visible"), 'typeahead is visible');
        equal(typeahead.$menu.find('li').length, 3, 'has 3 items in menu');
        equal(typeahead.$menu.find('.active').length, 1, 'one item is active');

        typeahead.$menu.remove();
    });

    test("should not explode when invalid display property entered", function () {
        var $input = $('<input />').typeahead({
                source: [{ id: 1, invalidproperty: 'aa' }, { id: 2, invalidproperty: 'ab' }, { id: 3, invalidproperty: 'ac'}]
            }),
            typeahead = $input.data('typeahead');

        $input.val('a');
        typeahead.lookup();

        ok(typeahead.$menu.is(":visible"), 'typeahead is visible');
        equal(typeahead.$menu.find('li').length, 0, 'has no items in menu');
        equal(typeahead.$menu.find('.active').length, 0, 'no items are active');

        typeahead.$menu.remove();
    });

    test("should not explode when regex chars are entered", function () {
        var $input = $('<input />').typeahead({
                source: [{ id: 1, name: 'aa' }, { id: 2, name: 'ab' }, { id: 3, name: 'ac' }, { id: 4, name: 'mdo*' }, { id: 5, name: 'fat+'}]
            }),
            typeahead = $input.data('typeahead');

        $input.val('+');
        typeahead.lookup();

        ok(typeahead.$menu.is(":visible"), 'typeahead is visible');
        equal(typeahead.$menu.find('li').length, 1, 'has 1 item in menu');
        equal(typeahead.$menu.find('.active').length, 1, 'one item is active');

        typeahead.$menu.remove();
    });

    test("should hide menu when query entered", function () {
        stop();

        var $input = $('<input />').typeahead({
                source: [{ id: 1, name: 'aa' }, { id: 2, name: 'ab' }, { id: 3, name: 'ac'}]
            }),
            typeahead = $input.data('typeahead');

        $input.val('a');
        typeahead.lookup();

        ok(typeahead.$menu.is(":visible"), 'typeahead is visible');
        equal(typeahead.$menu.find('li').length, 3, 'has 3 items in menu');
        equal(typeahead.$menu.find('.active').length, 1, 'one item is active');

        $input.blur();

        setTimeout(function () {
            ok(!typeahead.$menu.is(":visible"), "typeahead is no longer visible");
            start();
        }, 200);

        typeahead.$menu.remove();
    });

    test("should set next item when down arrow is pressed", function () {
        var $input = $('<input />').typeahead({
                source: [{ id: 1, name: 'aa' }, { id: 2, name: 'ab' }, { id: 3, name: 'ac'}]
            }),
            typeahead = $input.data('typeahead');

        $input.val('a');
        typeahead.lookup();

        ok(typeahead.$menu.is(":visible"), 'typeahead is visible');
        equal(typeahead.$menu.find('li').length, 3, 'has 3 items in menu');
        equal(typeahead.$menu.find('.active').length, 1, 'one item is active');
        ok(typeahead.$menu.find('li').first().hasClass('active'), "first item is active");

        $input.trigger({
            type: 'keydown',
            keyCode: 40
        });

        ok(typeahead.$menu.find('li').first().next().hasClass('active'), "second item is active");

        $input.trigger({
            type: 'keydown',
            keyCode: 38
        });

        ok(typeahead.$menu.find('li').first().hasClass('active'), "first item is active");

        typeahead.$menu.remove();
    });


    test("should set input value to selected item", function () {
        var $input = $('<input />').typeahead({
                source: [{ id: 1, name: 'aa' }, { id: 2, name: 'ab' }, { id: 3, name: 'ac'}]
            }),
          typeahead = $input.data('typeahead'),
          changed = false;

        $input.val('a');
        typeahead.lookup();

        $input.change(function () { changed = true });

        $(typeahead.$menu.find('li')[2]).mouseover().click();

        equal($input.val(), 'ac', 'input value was correctly set');
        ok(!typeahead.$menu.is(':visible'), 'the menu was hidden');
        ok(changed, 'a change event was fired');

        typeahead.$menu.remove();
    });


    test("should handle multiple object values", function () {
        var $input = $('<input />').typeahead({
                source: [{ id: 1, name: 'aa', type: 'small' }, { id: 2, name: 'ab', type: 'big' }, { id: 3, name: 'ac', type: 'medium'}],
                val: ['name', 'type'],
                itemSelected: function (item,values,text) { vals = values }
            }),
          typeahead = $input.data('typeahead'),
          changed = false;

        $input.val('a');
        typeahead.lookup();

        $input.change(function () { changed = true });

        $(typeahead.$menu.find('li')[2]).mouseover().click();

        equal($input.val(), 'ac', 'input value was correctly set');
        equal(vals.toJSON, {'name': 'ac', 'type': 'medium'}.toJSON, 'returns the correct value object');
        ok(!typeahead.$menu.is(':visible'), 'the menu was hidden');
        ok(changed, 'a change event was fired');

        typeahead.$menu.remove();
    });

    test('basic ajax url as source should work', function() {
        var $input = $('<input />').typeahead({ ajax: '/test' }),
            typeahead = $input.data('typeahead');

        stop();  
  
        $input.val('aaa');
        typeahead.lookup();
    
        setTimeout(function() {  
            start();  

            ok(typeahead.$menu.is(":visible"), 'typeahead is visible');
            equal(typeahead.$menu.find('li').length, 1, 'has 1 items in menu');
            equal(typeahead.$menu.find('.active').length, 1, 'one item is active');
            typeahead.$menu.remove();
        }, 2000);  
    }); 

    test('ajax object as source should work', function() {    
        var $input = $('<input />').typeahead({ ajax: { url: '/test', triggerLength: 1 } }),
            typeahead = $input.data('typeahead');

        stop();  
  
        $input.val('a');
        typeahead.lookup();
    
        setTimeout(function() {  
            start();  
            ok(typeahead.$menu.is(":visible"), 'typeahead is visible');
            equal(typeahead.$menu.find('li').length, 4, 'has 4 items in menu');
            equal(typeahead.$menu.find('.active').length, 1, 'one item is active');
            typeahead.$menu.remove();
        }, 2000);  
    }); 
});