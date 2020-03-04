using System.Threading;
using System.Threading.Tasks;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Persistence;

namespace Application.User
{
  public class Login
  {
    public class Query : IRequest<AppUser>
    {
      public string Email { get; set; }
      public string Password { get; set; }
    }

    public class QueryValidator : AbstractValidator<Query>
    {
      public QueryValidator()
      {
        RuleFor(x => x.Email).NotEmpty();
        RuleFor(x => x.Password).NotEmpty();
      }
    }

    public class Handler : IRequestHandler<Query, AppUser>
    {
      public Handler(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager)
      {

      }

      public async Task<AppUser> Handle(Query request, CancellationToken cancellationToken)
      {
        // handler logic goes here
      }

      public Task<AppUser> Handle(Query request, CancellationToken cancellationToken)
      {
        throw new System.NotImplementedException();
      }
    }
  }
}