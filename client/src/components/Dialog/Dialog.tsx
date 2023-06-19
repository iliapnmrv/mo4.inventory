import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

type Props = {
  open: boolean;
  handleClose: () => void;
  title?: string;
  text: string;
  confirmAction: () => void;
  confirmText: string;
  cancelText?: string;
};

const AlertDialog = ({
  open,
  handleClose,
  title,
  text,
  confirmAction,
  confirmText,
  cancelText,
}: Props) => {
  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {text}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{cancelText ?? "Отменить"}</Button>
          <Button onClick={confirmAction} color="error" variant="outlined">
            {confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
export default AlertDialog;
