export class TandemViewer {
  private viewer: any;
  private app: any;

  constructor(div: HTMLElement, token: string) {
    // @ts-ignore
    return new Promise<TandemViewer>(async (resolve) => {
      // run the curl script and copy the fresh Access-Token here
      const _access_token: string = token;
      // Open Tandem Viewer
      const options: Autodesk.Viewing.InitializerOptions = {
        env: "DtProduction",
        api: "dt",
        productId: "Digital Twins",
        corsWorker: true,
      };

      // console.log("facilities");
      const av: any = Autodesk.Viewing;
      av.Initializer(options, () => {
        this.viewer = new av.GuiViewer3D(div, {
          extensions: ["Autodesk.BoxSelection"],
          screenModeDelegate: av.NullScreenModeDelegate,
          theme: "light-theme",
        });
        this.viewer.start();
        av.endpoint.HTTP_REQUEST_HEADERS[
          "Authorization"
        ] = `Bearer ${_access_token}`;
        this.app = new Autodesk.Tandem.DtApp();
        // console.log(this.app);
        // window.DT_APP = this.app;
        resolve(this);
      });
    });
  }

  async fetchFacilities(URN: string): Promise<any[]> {
    const FacilitiesSharedWithMe = await this.app.getCurrentTeamsFacilities();
    const myFacilities = await this.app.getUsersFacilities();
    // console.log("myFacilities", myFacilities);
    return [].concat(FacilitiesSharedWithMe, myFacilities);
  }

  async openFacility(facility: any): Promise<void> {
    this.app.displayFacility(facility, false, this.viewer);
  }
}
