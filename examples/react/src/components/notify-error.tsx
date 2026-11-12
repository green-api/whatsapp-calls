import { CloseRounded, Phone } from '@mui/icons-material';
import { notification } from 'antd';

import { store } from 'store';
import 'styles/components/notify-error.css';

const CONSOLE_URL = 'https://console.green-api.com';

/** The Ultra plan checkout for the instance the app is signed in with. */
const upgradeUrl = () => {
  const { idInstance } = store.getState().userReducer.credentials;

  return idInstance
    ? `${CONSOLE_URL}/instanceList/cart/ULTRA?idInstances=${encodeURIComponent(idInstance)}&backSkipTariffs&notIncludeExpiredInstances`
    : CONSOLE_URL;
};

/** The REST client throws `<method> failed: <status> <body>`; the status is all that is needed. */
const failureStatus = (message: string) => {
  const match = /^\w+ failed: (\d+)\b/.exec(message);

  return match ? Number(match[1]) : null;
};

/** The quota refusal gets its own card; every other failure keeps antd's standard toast. */
export const notifyError = (err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);

  if (failureStatus(message) !== 466) {
    notification.error({ message: 'Something went wrong', description: message, duration: 10 });

    return;
  }

  notification.open({
    className: 'notify-error',
    message: null,
    description: (
      <div className="notify-error__content">
        <span className="notify-error__icon" aria-hidden="true">
          <Phone />
        </span>
        <div className="notify-error__text">
          <span className="notify-error__title">Calls have run out</span>
          <span>
            Calls on your plan for this month are used up. On the Ultra plan calls are unlimited.
          </span>
        </div>
        <a
          className="notify-error__action"
          href={upgradeUrl()}
          target="_blank"
          rel="noopener noreferrer"
        >
          Upgrade to Ultra
        </a>
      </div>
    ),
    closeIcon: <CloseRounded className="notify-error__close" />,
    placement: 'topRight',
    duration: 10,
    role: 'alert',
  });
};
