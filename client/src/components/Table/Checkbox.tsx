import React, {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Checkbox as CheckboxMUI } from "@mui/material";
import { useAppSelector } from "hooks/redux";
import { useActions } from "hooks/actions";

type Props = {
  qr: number;
  model: string;
};

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const Checkbox = ({ qr, model }: Props) => {
  const { toggleSelectedItem } = useActions();

  const { selectedItems } = useAppSelector((state) => state.item);

  const onCheck = useCallback((qr: number) => {
    toggleSelectedItem({ qr, model });
  }, []);

  return (
    <CheckboxMUI
      {...label}
      checked={selectedItems.some((item) => item.qr === qr)}
      onClick={(event) => {
        event.stopPropagation();
        onCheck(qr);
      }}
    />
  );
};

export default memo(Checkbox);
