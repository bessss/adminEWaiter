function menuOperation(owner)
{
  this.menuForm_Edit = new Object();
  this.editWindow = new Object();
  this.owner = owner;

  this.menu_Delete = menu_Delete;
  this.menu_Edit = menu_Edit;
}

function menu_Edit(state,table)
{
  var self = this;
  this.menuForm_Edit = Ext.create('Ext.form.Panel',{
    width: 400,
    height: 440,
    layout: 'anchor',
    margin: 10,
    border: 0,
    id: 'menuFrom_Edit',
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
      hidden: true,
      listeners:
      {
        added:
        {
          fn: function()
          {
            Ext.getCmp('menuType').select( Ext.getCmp('menuTypeLookup').getSubmitValue() );
          }
        }
      }
    }],
    buttons:[
    {
      text: 'Оправить',
      handler: function()
      {
        if ( Ext.getCmp('img').getValue() == '' )
        {
          //Ext.getCmp('menuFrom_Edit').remove('img');
          Ext.getCmp('img').setDisabled(true);
        }

        Ext.getCmp('menuFrom_Edit').submit({
          url: '../../includes/insert_menu.php',
          success: function(form, action)
          {
            Ext.MessageBox.alert('Изменение пункта меню',action.result.message);
            Ext.getStore('menuStore').load();
            Ext.getCmp('editWindow').close();
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
        Ext.getCmp('editWindow').close();
      }
    }]
  });

  this.editWindow = Ext.create('Ext.window.Window', {
    title: 'Редактирование',
    height: 440,
    width: 400,
    layout: 'fit',
    modal: true,
    id: 'editWindow',
    items: self.menuForm_Edit,
    bodyStyle: {background: '#ffffff'}
  }).show();

  this.owner.data_Change(state,table);
}

function menu_Delete(id)
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
        Ext.Ajax.request({
          url: '../../includes/delete_menu.php',
          params: 'id=' + id,
          success: function(response)
          {
            Ext.getStore('menuStore').load();
          }
        });;
      }
    },
    icon: Ext.Msg.ERROR
  });
}