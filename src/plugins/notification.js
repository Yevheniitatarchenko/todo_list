import { ref, h, provide } from 'vue';

const NotificationPlugin = {
  install(app) {
    const notifications = ref([]);

    const addNotification = (message, type) => {
      const id = notifications.value.length + 1
      notifications.value.push(
        {
          id: id,
          message: message,
          type: type
        }
      );

      setTimeout(() => {
        removeNotification(id);
      }, 3500);
    };

    const removeNotification = (id) => {
      notifications.value = notifications.value.filter((n) => n.id !== id);
    };

    const NotificationComponent = {
      render() {
        return h('div', { class: 'fixed z-1 top-5 right-5 space-y-2' },
          ...notifications.value.map((notification) =>
            h('div', {
              onClick: () => removeNotification(notification.id),
              key: notification.id,
              class: [
                'w-80 p-4 rounded-lg shadow-lg flex items-center text-white',
                notification.type === 'success'
                  ? 'bg-green-600'
                  : notification.type === 'error'
                    ? 'bg-red-600'
                    : 'bg-yellow-600',
              ],
            }, [
              h('span', notification.message),
            ])
          )
        );
      }
    };

    app.provide('notify', addNotification);
    app.component('GlobalNotification', NotificationComponent);
  },
};

export default NotificationPlugin;