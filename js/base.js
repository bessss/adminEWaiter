function get_url()
{
  var temp = window.location.href;
  return temp.substr( temp.lastIndexOf('.php') + 5, temp.length );
}

function check_menu(url)
{
  var temp = window.location.href;
  if ( temp.substr( temp.lastIndexOf('.info/') + 6, temp.lastIndexOf('.php') - temp.lastIndexOf('.info/') - 6 ) == url)
  {
    return true;
  }
  else
  {
    return false;
  }
}

function ownerObject()
{
  this.restorant;
  
  this.set_baseParameters = set_baseParameters;
  this.set_baseParameters();
}

function set_baseParameters()
{
  this.restorant = Ext.JSON.decode( Ext.get('service_information').getHTML() );
}

var owner_object = new Object();
var bgh = '';
function change_restourantTitle()
{
  if ( Ext.getCmp('edit_restaurantName') != undefined )
  {
    Ext.getCmp('edit_restaurantName').show();
  }
  else
  {
    Ext.create('Ext.window.Window', {
      title: 'Редактирование названия ресторана',
      height: 100,
      width: 400,
      id: 'edit_window',
      modal: true,
      style: 'text-align: center',
      id: 'edit_restaurantName',
      items:[
      {
        xtype: 'textfield',
        name: 'name',
        id: 'id_restaurant',
        fieldLabel: 'Name',
        width: 340,
        value: owner_object.restorant['name_restorant'],
        margin: 10
      },
      {
        xtype: 'button',
        text: 'Сохранить',
        handler: function()
        {
          Ext.Ajax.request({
            url: '../includes/edit_restaurantName.php',
            params: 'shotName=' + Ext.getCmp('id_restaurant').getValue() + '&id_restaurant=' + owner_object.restorant['id_restorant'],
            success: function(response)
            {
              Ext.get('restorantName').update('Администрирование ресторана: ' + Ext.getCmp('id_restaurant').getValue() + ' <img src="http://ewaiter.info/images/b_edit.png">');
              owner_object.restorant['name_restorant'] = Ext.getCmp('id_restaurant').getValue();
              Ext.getCmp('edit_restaurantName').destroy();
            }
          });
        }
      }],
      bodyStyle: {background: '#ffffff'}
    }).show();
  }
}

Ext.onReady(function()
{
  owner_object = new ownerObject();
  Ext.create('Ext.container.Viewport',{
    layout: 'border',
    id: 'frame',
    renderTo: Ext.getBody(),
    items:[
    {
      region: 'north',
      id: 'frame_north',
      baseCls: 'title_north',
      html: '<div class="x-panel-header-text-container-default restourant_title" id="restorantName" onclick="change_restourantTitle()">\
      Администрирование ресторана: ' + owner_object.restorant['name_restorant'] + ' <img src="http://ewaiter.info/images/b_edit.png"></div>',
      items:[
      {
        xtype: 'button',
        text: 'Выйти',
        style: 'float:right;margin-top: 4px;',
        icon: '../../images/icon-error2.png',
        height: 24,
        width: 60,
        handler:function()
        {
          Ext.Msg.show({
            title:'Выход из зоны администрирования',
            msg: 'Вы действительно хотите выйти из зоны администратора ?',
            buttons: Ext.Msg.YESNO,
            fn: function(btn)
            {
              if ( btn == 'yes' )
              {
                location = 'http://ewaiter.info';
              }
            },
            icon: Ext.Msg.INFO
          });
        }
      }],
      border: false,
      margins: '0 0 5 0',
      height: 30
    },
    {
      region: 'west',
      collapsible: true,
      title: 'Меню',
      width: 200,
      items:[
      {
        xtype: 'menu',
        width: '100%',
        id: 'main_menu',
        height: 1500,
        border: 0,
        margin: '0 0 10 0',
        renderTo: Ext.getBody(),
        floating: false,
        items:[
        {
          text: 'Работа с меню',
          checked: check_menu('index'),
          group: 'langs',
          handler: function(){document.location.href = 'index.php?' + get_url();}
        },
        {
          text: 'Просмотр заказов',
          checked: check_menu('orders'),
          group: 'langs',
          handler: function(){document.location.href = 'orders.php?' + get_url();}
        },
        {
          text: 'Резерв',
          checked: check_menu('test'),
          group: 'langs'
        }]
      }]
    }/*,
    {
      region: 'south',
      title: 'Информационные сообщения',
      collapsible: true,
      html: 'test',
      split: true,
      height: 50,
      minHeight: 50,
      cls: 'title_north'
    }*/,
    {
      region: 'center',
      xtype: 'tabpanel',
      activeTab: 0,
      id: 'frame_center'
    }]
  });
});