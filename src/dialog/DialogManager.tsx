import React from 'react';
import RootSiblings from 'react-native-root-siblings';

import DialogComponent from './DialogComponent';

const DESTROY_TIMEOUT: number = 500;

class DialogManager {

  private dialogs: RootSiblings[] = [];

  get currentDialog() {
    return this.dialogs[this.dialogs.length - 1];
  }

  add(props: any, callback: ()=>void): RootSiblings {
    const dialog = new RootSiblings(
      <DialogComponent
        {...props}
        onDismissed={() => { this.onDialogDismissed(props.onDismissed); }}
      />,
      callback,
    );
    this.dialogs.push(dialog);
    return dialog;
  }

  destroy(): void {
    const dialog = this.dialogs.pop();
    setTimeout(() => {
      if (dialog) {
        dialog.destroy();
      }
    }, DESTROY_TIMEOUT);
  }

  onDialogDismissed = (onDismissed: () => void): void => {
    onDismissed();
    this.destroy();
  };

  update = (props: any, callback: () => void): void => {
    this.currentDialog.update(
      <DialogComponent
        {...props}
        onDismissed={() => { this.onDialogDismissed(props.onDismissed); }}
      />,
      callback,
    );
  };

  show = (props: any, callback: () => void): RootSiblings => this.add({
    ...props,
    show: true,
  }, callback);

  dismiss = (callback: () => void): void => {
    this.update({
      show: false,
    }, callback);
  };

  dismissAll = (callback?: () => void): void => {
    this.dialogs.forEach(() => {
      this.dismiss(callback);
    });
  }
}

export default DialogManager;
