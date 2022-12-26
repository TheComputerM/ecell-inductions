import {
  HopeProvider,
  ColorModeScript,
  Button,
  Box,
  Text,
  Grid,
  Container,
  Heading,
  Divider,
  extendTheme,
  IconButton,
  Icon,
  useColorMode,
} from "@hope-ui/core";
import { FaRegularMoon, FaRegularSun } from "solid-icons/fa";
import {
  Component,
  createResource,
  Suspense,
  For,
  createSignal,
  createEffect,
  onMount,
  Show,
} from "solid-js";
import { render } from "solid-js/web";

type AssetResponseType = {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  changePercent24Hr: string;
  vwap24Hr: string;
};

const AssetCard: Component<{
  asset: AssetResponseType;
  selected: boolean;
  onSelect: () => void;
}> = (props) => {
  const isIncreasing = Number(props.asset.changePercent24Hr) > 0;
  return (
    <Box
      padding={3}
      rounded="md"
      border={({ vars }) => `2px solid ${vars.colors.neutral["200"]}`}
      boxShadow="md"
      _dark={{
        borderColor: "neutral.700",
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Text fontWeight="semibold" size="2xl">
          {props.asset.name}
        </Text>
        <Box
          display="flex"
          alignItems="center"
          px={2}
          py={1}
          rounded="full"
          bgColor="info.100"
          color="info.600"
          _dark={{
            bgColor: "info.900",
            color: "info.300"
          }}
        >
          <Text
            as="span"
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
          >
            {props.asset.symbol}
          </Text>
        </Box>
      </Box>
      <Box color="neutral.400">
        <Text as="span" size="lg">
          {props.asset.priceUsd}
        </Text>
        <Text as="span" ml={1} size="xs" fontWeight="bold">
          USD
        </Text>
      </Box>
      <Box>
        <Text
          as="span"
          fontFamily="monospace"
          color={isIncreasing ? "success.400" : "danger.400"}
        >
          {parseFloat(props.asset.changePercent24Hr).toFixed(2)}% today
        </Text>
      </Box>
      <br />
      <Button
        isFullWidth
        colorScheme={props.selected ? "success" : "info"}
        variant={props.selected ? "soft" : "outlined"}
        size="sm"
        cursor="pointer"
        onClick={props.onSelect}
      >
        {props.selected ? "Selected" : "Select"}
      </Button>
    </Box>
  );
};

const AvailableAssetList: Component = () => {
  const [assets] = createResource<{ data: AssetResponseType[] }>(async () =>
    (await fetch("https://api.coincap.io/v2/assets")).json()
  );
  const [selectedAssets, setSelectedAssets] = createSignal<string[]>([]);

  function selectAsset(asset: AssetResponseType) {
    if (selectedAssets().includes(asset.id)) {
      setSelectedAssets((a) => a.filter((i) => i !== asset.id));
    } else {
      setSelectedAssets((a) => [...a, asset.id]);
    }
  }

  onMount(() => {
    setSelectedAssets(
      JSON.parse(localStorage.getItem("selected-assets") || "[]")
    );
  });

  createEffect(() => {
    localStorage.setItem("selected-assets", JSON.stringify(selectedAssets()));
  });

  return (
    <Container p={8}>
      <Heading level="1" size="3xl">
        Selected Assets
      </Heading>
      <br />
      <Show
        when={selectedAssets().length}
        fallback={
          <Box
            display="grid"
            height={175}
            border={({ vars }) => `4px dashed ${vars.colors.neutral["200"]}`}
            rounded="sm"
            placeContent="center"
            _dark={{
              borderColor: "neutral.800"
            }}
          >
            <Heading color="neutral.400" level="2" size="2xl">
              No Assets Selected
            </Heading>
          </Box>
        }
      >
        <Suspense fallback={<h1>Loading</h1>}>
          <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
            <For
              each={assets()?.data.filter(({ id }) =>
                selectedAssets().includes(id)
              )}
            >
              {(asset) => (
                <AssetCard
                  asset={asset}
                  selected={true}
                  onSelect={() => selectAsset(asset)}
                />
              )}
            </For>
          </Grid>
        </Suspense>
      </Show>
      <br />
      <Divider thickness="3px" />
      <br />
      <Heading level="1" size="3xl">
        Available Assets
      </Heading>
      <br />
      <Suspense fallback={<h1>Loading</h1>}>
        <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
          <For each={assets()?.data}>
            {(asset) => (
              <AssetCard
                asset={asset}
                selected={selectedAssets().includes(asset.id)}
                onSelect={() => selectAsset(asset)}
              />
            )}
          </For>
        </Grid>
      </Suspense>
    </Container>
  );
};

const App: Component = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        m={6}
        py={2}
        px={4}
        rounded="xl"
        backgroundColor="neutral.100"
        _dark={{ backgroundColor: "neutral.800" }}
      >
        <Heading level={1} size="xl">ECell mai lelo</Heading>
        <div style={{ "flex-grow": 1 }}></div>
        <IconButton onClick={toggleColorMode} aria-label="Switch Theme">
          <Icon as={colorMode() === "light" ? FaRegularMoon : FaRegularSun} />
        </IconButton>
      </Box>
      <AvailableAssetList />
    </>
  );
};

const Page: Component = () => {
  return (
    <>
      <ColorModeScript />
      <HopeProvider
        theme={extendTheme({
          fonts: {
            sans: "Inter, 'Segoe UI', Roboto, sans-serif",
          },
        })}
      >
        <App />
      </HopeProvider>
    </>
  );
};

render(() => <Page />, document.body);
