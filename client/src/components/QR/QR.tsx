import { Box, IconButton, Snackbar } from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";
import React, { useRef, useState } from "react";
import { IItem } from "redux/item/item.api";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import { useSnackbar } from "notistack";

type Props = {
  item: IItem;
};

const QR = ({ item }: Props) => {
  const qrRef = useRef(null);

  const { enqueueSnackbar } = useSnackbar();

  const handleCopy = () => {
    navigator.clipboard
      .writeText(
        `${item.type_id}${("0" + item.device_id).slice(-2)}${(
          "0" + item.month
        ).slice(-2)}${item.year}${("00000" + item.qr).slice(-5)}\n${
          item.name
        }\n${item.model}\n${item.serial_number}`
      )
      .then(() => {
        enqueueSnackbar("Данные скопированы в буфер обмена", {
          variant: "success",
        });
      })
      .catch(() => {
        enqueueSnackbar("Ошибка при копировании", {
          variant: "error",
        });
      });
  };

  const onDownload = () => {
    const oldCanvas = qrRef.current?.querySelector("canvas");

    const newCanvas = document.createElement("canvas");
    const context = newCanvas.getContext("2d");

    newCanvas.width = 300;
    newCanvas.height = 300;

    // create white background and center the text
    context.fillStyle = "white";
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.fillRect(0, 0, 300, 300);

    const offset: number = 70;
    // create style for text inside canvas
    context.font = "32px Arial";
    context.fillStyle = "#000000";

    // copy oldCanvas to newCanvas
    context.drawImage(oldCanvas, 10, 10, 280, 280);
    context.fillText(
      ("00000" + item.qr).slice(-5),
      newCanvas.width / 2 - offset,
      17
    );
    context.fillText(
      ("00000" + item.qr).slice(-5),
      newCanvas.width / 2 + offset,
      17
    );
    context.fillText(
      ("00000" + item.qr).slice(-5),
      newCanvas.width / 2 - offset,
      288
    );
    context.fillText(
      ("00000" + item.qr).slice(-5),
      newCanvas.width / 2 + offset,
      288
    );

    const image = newCanvas.toDataURL("image/png");
    newCanvas.toBlob((blob) => {
      const item = new ClipboardItem({ "image/png": blob });

      navigator.clipboard
        .write([item])
        .then(() => {
          enqueueSnackbar("Код скопирован в буфер обмена", {
            variant: "success",
          });
        })
        .catch((e) => console.log(e));
    });
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <IconButton aria-label="delete" onClick={handleCopy}>
          <ContentCopyIcon />
        </IconButton>

        <Box sx={{ padding: 1, width: "100%" }}>
          <p>
            <>
              {item.type_id}
              {("0" + item.device_id).slice(-2)}
              {("0" + item.month).slice(-2)}
              {item.year}
              {("00000" + item.qr).slice(-5)}
            </>
          </p>
          <p>{item.name}</p>
          <p>{item.model}</p>
          <p>{item.serial_number}</p>
        </Box>
        <Box
          sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
        >
          <IconButton aria-label="delete" onClick={onDownload}>
            <ContentCopyIcon />
          </IconButton>
          <div ref={qrRef}>
            <QRCodeCanvas
              style={{ height: 130, width: 130 }}
              id={"canvas"}
              size={500}
              // imageSettings={{ height: 300, width: 300 }}
              includeMargin={true}
              value={`${item.type_id}${("0" + item.device_id).slice(-2)}${(
                "0" + item.month
              ).slice(-2)}${item.year}${("00000" + item.qr).slice(-5)}\n${
                item.name
              }\n${item.model}\n${item.serial_number}`}
            />
          </div>
        </Box>
      </Box>
    </>
  );
};

export default QR;
