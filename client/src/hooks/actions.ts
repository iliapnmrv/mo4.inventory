import { useDispatch } from "react-redux";
import { bindActionCreators } from "@reduxjs/toolkit";
import { itemActions } from "redux/item/item.slice";

const actions = {
  ...itemActions,
};

export const useActions = () => {
  const dispatch = useDispatch();
  return bindActionCreators(actions, dispatch);
};
