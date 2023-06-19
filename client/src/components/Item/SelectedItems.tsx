import { Chip, Grid } from "@mui/material";
import { useActions } from "hooks/actions";
import { useAppSelector } from "hooks/redux";
import { QRzeros } from "src/utils/utils";

const SelectedItems = () => {
  const { selectedItems } = useAppSelector((state) => state.item);
  const { toggleSelectedItem } = useActions();

  return selectedItems.length ? (
    <Grid container direction="row" spacing={1} sx={{ pb: 1 }}>
      {selectedItems.map(({ qr, model }) => (
        <Grid key={qr} item>
          <Chip
            key={qr}
            label={QRzeros(qr)}
            onDelete={() => toggleSelectedItem({ qr, model })}
          />
        </Grid>
      ))}
    </Grid>
  ) : null;
};

export default SelectedItems;
