using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace LaguitoLibre.Api.Common;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected string CurrentRun => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

    protected IActionResult Success<T>(T data, string message = "OK")
    => Ok(ApiResponse.Ok(data, message));

    protected IActionResult CreatedOk<T>(T data, string message = "Creado correctamente.")
    => StatusCode(StatusCodes.Status201Created, ApiResponse.Ok(data, message));

    protected IActionResult BadReq(string message, params string[] errors)
    => BadRequest(ApiResponse.Fail(message, errors.ToList()));

    protected IActionResult NotFoundMsg(string message)
    => NotFound(ApiResponse.Fail(message));

    protected IActionResult ConflictMsg(string message, params string[] errors)
    => Conflict(ApiResponse.Fail(message, errors.ToList()));

    protected IActionResult Unauthorized401(string message)
    => Unauthorized(ApiResponse.Fail(message));

    protected IActionResult Forbidden403(string message)
    => StatusCode(StatusCodes.Status403Forbidden, ApiResponse.Fail(message));
}
