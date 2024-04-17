import React, { useEffect, useState, useMemo } from "react";
import Viewer from "./components/Viewer";
import "./App.css";
import { initializeViewer } from "./utils/viewerUtils";
import { useLocation, useParams } from "react-router-dom";

const App = () => {
  const [isViewerInitialized, setIsViewerInitialized] =
    useState<boolean>(false);
  const [facilityList, setFacilityList] = useState<
    Autodesk.Tandem.DtFacility[]
  >([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>();
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [token, setToken] = useState("");

  const { search } = useLocation();
  const url = new URLSearchParams(search);
  const id = url.get("id");

  useEffect(() => {
    initializeViewer().then((data) => {
      function cb(acctoken: string) {
        setToken(acctoken);
      }

      data.getAccessToken(cb);
      setIsViewerInitialized(true);
    });
  }, []);

  useEffect(() => {
    if (facilityList.length > 0 && id) {
      const initialFacility = facilityList.find((item) => item.twinId === id);

      if (initialFacility) {
        setSelectedFacilityId(id);
      }
    }
  }, [id, facilityList, selectedFacilityId]);

  const onAppInitialized = async (app: Autodesk.Tandem.DtApp) => {
    try {
      const result: any = await app.fetchFacilities();
      setFacilityList(result);
    } catch (error) {
      console.log(error);
    }
  };

  const onLoad = () => {
    const facility = facilityList.find((f) => f.twinId === selectedFacilityId);

    if (facility) {
      setSelectedFacility(facility);
    }
  };
  useEffect(() => {
    if (selectedFacilityId && id) {
      onLoad();
    }
  }, [id, selectedFacilityId]);

  const facilityItems = useMemo(() => {
    return facilityList.map((item) => {
      let name = item.settings.props["Identity Data"]["Project Name"];
      if (name.length === 0) {
        name = item.settings.props["Identity Data"]["Building Name"];
      }
      setSelectedFacilityId(item.twinId);
      return (
        <option key={item.twinId} value={item.twinId}>
          {name}
        </option>
      );
    });
  }, [facilityList]);

  return (
    <React.Fragment>
      {!id && (
        <AppHeader
          setSelectedFacilityId={setSelectedFacilityId}
          selectedFacilityId={selectedFacilityId}
          facilityItems={facilityItems}
          onLoad={onLoad}
        >
          <div className="right">
            {isViewerInitialized && (
              <div className="viewer-container">
                <Viewer
                  onAppInitialized={onAppInitialized}
                  facility={selectedFacility}
                  token={token}
                />
              </div>
            )}
          </div>
        </AppHeader>
      )}
      {id && (
        <div className="right">
          {isViewerInitialized && (
            <div className="viewer-container">
              <Viewer
                onAppInitialized={onAppInitialized}
                facility={selectedFacility}
                token={token}
              />
            </div>
          )}
        </div>
      )}
    </React.Fragment>
  );
};

export default App;

type proptype = {
  selectedFacilityId: any;
  setSelectedFacilityId: any;
  facilityItems: any;
  onLoad: () => any;
  children: React.ReactElement;
};

function AppHeader({
  selectedFacilityId,
  setSelectedFacilityId,
  facilityItems,
  onLoad,
  children,
}: proptype) {
  return (
    <>
      {/* <div className="header">
        <div className="header-icon"></div>
        <div className="header-title">Tandem</div>
      </div> */}
      <div className="main">
        <div className="left">
          <select
            value={selectedFacilityId}
            onChange={(e) => {
              setSelectedFacilityId(e.target.value);
            }}
          >
            {facilityItems}
          </select>
          <button onClick={onLoad}>Load</button>
        </div>
        {children}
      </div>
    </>
  );
}