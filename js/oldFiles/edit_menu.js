function edit_menu(state,table)
{
  var edit_form = Ext.create('Ext.form.Panel',{
    width: 400,
    height: 400,
    layout: 'anchor',
    margin: 10,
    border: 0,
    id: 'edit_form_menu',
    items:[
    {
      xtype: 'textfield',
      fieldLabel: 'Название',
      name: 'name',
      id: 'name',
      width: 350
    },
    {
      xtype: 'filefield',
      fieldLabel: 'Изображение',
      name: 'img',
      id: 'img',
      width: 350
    },
    {
      xtype: 'textareafield',
      fieldLabel: 'Краткое описание',
      id: 'shortDescription',
      name: 'shortDescription',
      width: 350
    },
    {
      xtype: 'textareafield',
      fieldLabel: 'Полное описание',
      id: 'Description',
      name: 'Description',
      width: 350
    },
    {
      xtype: 'textfield',
      fieldLabel: 'Эн. ценность порции',
      id: 'energyValuePortion',
      name: 'energyValuePortion',
      width: 350
    },
    {
      xtype: 'textfield',
      fieldLabel: 'Эн. ценность 100гр',
      id: 'energyValue100',
      name: 'energyValue100',
      width: 350
    },
    {
      xtype: 'textfield',
      fieldLabel: 'Стоимость',
      id: 'price',
      name: 'price',
      width: 350
    },
    {
      xtype: 'textfield',
      fieldLabel: 'Артикл',
      name: 'id',
      id: 'article',
      hidden: true,
      value: 'new'
    },
    {
      xtype: 'textfield',
      fieldLabel: 'ID ресторана',
      name: 'id_restaurant',
      id: 'id_restaurant',
      hidden: true,
      value: owner_object.restorant['id_restorant']
    },
    {
      xtype: 'combo',
      editable: false,
      fieldLabel: 'Тип меню',
      store: Ext.data.StoreManager.lookup('menutypeStore'),
      queryMode: 'local',
      displayField: 'menuType',
      valueField: 'id',
      id: 'menuType',
      listeners:
      {
        added:
        {
          fn: function()
          {
            Ext.getCmp('menuType').select( Ext.getCmp('menutype_lookup').getSubmitValue() );
          }
        }
      }
    }],
    buttons:[
    {
      text: 'Оправить',
      handler: function()
      {
        Ext.getCmp('edit_form_menu').submit({
          url: '../../includes/insert_menu.php',
          success: function(form, action)
          {
            Ext.MessageBox.alert('Изменение пункта меню',action.result.message);
            Ext.getStore('menuStore').load();
            Ext.getCmp('edit_window').close();
          },
          failure: function(form, action)
          { 
            Ext.MessageBox.alert('Изменение пункта меню',action.result.message);
          }
        });
      }
    },
    {
      text: 'Отмена',
      handler: function()
      {
        Ext.getCmp('edit_window').close();
      }
    }]
  });

  Ext.create('Ext.window.Window', {
    title: 'Редактирование',
    height: 400,
    width: 400,
    layout: 'fit',
    modal: true,
    id: 'edit_window',
    items: edit_form,
    bodyStyle: {background: '#ffffff'}
  }).show();

  get_menu_data(state,table);
}

function get_menu_data(state,table)
{
  if ( state != 'new' )
  {
    var temp_data = Ext.getCmp(table).selModel.selected.items[0].data;
    for (var i in temp_data)
    {
      if ( Ext.getCmp(i) != undefined )
      {
        switch ( Ext.getCmp(i).xtype )
        {
          case 'textfield':
          {
            Ext.getCmp(i).setValue( temp_data[i] );
            break;
          }
          case 'combo':
          {
            var temp = Ext.getCmp(i).store.data.items;
            for ( z = 0; z < temp.length; ++z )
            {
              if ( temp[z].data['name'] == temp_data[i] )
              {
                Ext.getCmp(i).select(temp[z].data['id']);
              }
            }
            break;
          }
          case 'displayfield':
          {
            Ext.getCmp(i).setValue( temp_data[i] );
            break;
          }
          case 'textareafield':
          {
            Ext.getCmp(i).setValue( temp_data[i] );
            break;
          }
        }
      }
    }
  }
}

function send_delet_data(id)
{
  Ext.Ajax.request({
    url: '../../includes/delete_menu.php',
    params: 'id=' + id,
    success: function(response)
    {
      Ext.getStore('menuStore').load();
    }
  });
}

function delet_menu(id)
{
  test = Ext.Msg.show({
    title:'Удаление пункта меню',
    id: 'dfgh',
    msg: 'Данное действие приведет к удалению пункта меню, Вы действительно хотите произвести удаление ?',
    buttons: Ext.Msg.YESNO,
    fn: function(btn)
    {
      if ( btn == 'yes' )
      {
        send_delet_data(id);
      }
    },
    icon: Ext.Msg.ERROR
  });
}